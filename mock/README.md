# Mock API

Reemplazo temporal del backend real (Java 21 + Spring Boot + MySQL, aún no construido). Habla
exactamente el mismo contrato que hablará el backend real, así que migrar después es solo cambiar
`VITE_API_URL` — ningún código del frontend debería necesitar cambios.

> Estado: completo. La mock API (Fases 1-2) es totalmente funcional sobre HTTP, y el frontend
> (Fases 3-6) está conectado a ella de extremo a extremo — cada pantalla obtiene datos reales,
> no quedan datos quemados ni hardcodeados en `src/`.

## Cómo correrlo

```bash
npm run mock:seed   # (re)genera mock/db.json a partir de mock/seed.js
npm run mock:fill   # cierra el hueco entre la última medición de cada dispositivo y ahora
npm run mock:live   # genera una medición nueva por dispositivo vinculado cada 15 min (en segundo plano)
npm run mock:alerts # crea/reinicia dos alertas PENDING de prueba en "Main House"
npm run mock        # inicia la mock API en http://localhost:8090/api
npm run dev:full    # corre Vite + la mock API + el generador continuo juntos
```

Variables de entorno (ambas opcionales):

- `PORT` — por defecto `8090`.
- `MOCK_DELAY` — retardo artificial por petición en ms, por defecto `250`, para que los estados
  de carga sean visibles durante el desarrollo. Usar `MOCK_DELAY=0` para iteración rápida o
  pruebas automatizadas.

Para forzar cualquier respuesta de error en una petición específica (y probar los estados de
error del frontend sin reproducir el fallo real), envía el header `x-mock-error: <status>`,
por ejemplo `x-mock-error: 500`. Se evalúa antes de la autenticación, así que funciona en
cualquier ruta.

`mock/db.json` es un **archivo generado** — nunca editarlo a mano. No está pensado para subirse
al control de versiones (es grande y totalmente reproducible); si estás configurando el repo por
primera vez, corre `npm run mock:seed` para crearlo. Es determinista en estructura y en valores
*relativos* a "ahora" (cada elección aleatoria pasa por el PRNG con semilla fija de
`mock/lib/prng.js`, nunca `Math.random()`), pero **"ahora" es el reloj real** (`new Date()`), no
una fecha ancla fija — así que dos corridas en días distintos ya no producen el mismo archivo
byte a byte, a propósito: los endpoints de consumo (`/consumption/summary`, `/hourly`,
`/history`) filtran por el reloj real, así que si "ahora" fuera una fecha fija del pasado, tarde
o temprano dejarían de encontrar mediciones de "hoy" o "esta semana" y las gráficas del frontend
quedarían vacías aunque `db.json` tenga miles de mediciones válidas (síntoma que motivó este
cambio).

### Telemetría continua (`mock:fill` / `mock:live` / `mock:alerts`)

Si ya tienes un `db.json` generado (por ejemplo, de ayer, o el de otra persona) y sus mediciones
más recientes quedaron en el pasado, `npm run mock:fill` (`mock/fill-measurements.js`) rellena el
hueco entre la última medición de cada dispositivo **vinculado** (con una fila activa en
`device-homes`) y `new Date()`, en pasos de 15 minutos, con el mismo perfil de potencia realista
por tipo de electrodoméstico que usa `mock/seed.js` (`mock/lib/appliance-profiles.js`) y
continuando `stored_energy` desde el último valor — nunca reinicia ni toca una medición que ya
existía. Los dispositivos sin vincular ("libres", ver más abajo) se dejan tal cual.

`npm run mock:live` (`mock/live-measurements.js`) hace lo mismo pero de forma continua: al
arrancar cierra el hueco (corre la misma lógica que `mock:fill`) y después, cada
`MEASUREMENT_INTERVAL_MS` (por defecto `900000` = 15 min), agrega una medición nueva por
dispositivo vinculado con `date_time = new Date()`. Después de generar las mediciones de cada
ciclo, también corre `resolveAlerts()` (`mock/lib/alert-resolver.js`, ver "Resolución automática
de alertas" más abajo) sobre el mismo `db.json`, así que una alerta puede resolverse sola en el
mismo tick en que su condición deja de cumplirse. Pensado para correr junto al servidor
(`npm run dev:full` ya lo incluye) y simular el flujo real de telemetría de un ESP32. Para
pruebas manuales rápidas, `MEASUREMENT_INTERVAL_MS=10000 npm run mock:live` genera una medición
cada 10 segundos en vez de cada 15 minutos.

`npm run mock:alerts` (`mock/generate-alerts.js`) crea dos alertas `PENDING` de prueba (una
`THRESHOLD`, una `CONNECTIVITY`) en "Main House", para poder ejercitar el flujo de resolución
automática sin esperar a que el sistema las genere orgánicamente. Es idempotente: cada corrida
resetea esas dos alertas a `PENDING` en vez de acumular duplicados, así se puede volver a probar
el flujo cuantas veces haga falta.

Los tres scripts escriben directamente en `mock/db.json` desde un proceso aparte del servidor —
igual que `mock/add-spare-devices.js` — pero, a diferencia de ese script, están pensados para
correr **mientras `npm run mock` ya está corriendo**. Por eso `mock/server.js` no solo lee estas
colecciones una vez al arrancar: antes de atender cada petición revisa si `db.json` cambió en
disco (un `statSync` barato) y, si cambió, recarga `measurements` (y su índice derivado), `alerts`
y `device-status-logs` (`refreshCollectionsFromDisk()`) — así una medición agregada por `mock:live`
aparece en `/consumption/*` (y en el passthrough `GET /api/measurements`), y una alerta creada por
`mock:alerts` o resuelta por `mock:live` aparece en `GET /api/alerts`, sin reiniciar el servidor.
Esto no es un mecanismo de bloqueo real: dos procesos escribiendo el mismo `db.json` en el
instante exacto en que ambos hacen I/O es una condición de carrera no resuelta del todo, aceptable
para una herramienta de mock/desarrollo local, no pensada para modelar escritores concurrentes
reales.

### Resolución automática de alertas

Las alertas ya no se resuelven con un botón manual: `mock/lib/alert-resolver.js` exporta
`resolveAlerts(db)`, que aplica dos reglas sobre cada alerta `PENDING` y muta `db.alerts` en
sitio (quien llama decide cuándo persistir):

- **`THRESHOLD`**: calcula el consumo de las últimas 24h del dispositivo (delta de
  `stored_energy` entre la medición más reciente y la más cercana a 24h antes, reutilizando
  `kwhDelta`/`latestReading` de `mock/lib/consumption.js`) y lo clasifica contra
  `consumption-levels`. Si el nivel resultante es estrictamente inferior al que apunta
  `consumption_level_id`, la alerta pasa a `RESOLVED`. Si el dispositivo no tiene 24h de
  historial todavía, se deja tal cual (ni se resuelve ni es un error).
- **`CONNECTIVITY`**: se resuelve en cuanto existe alguna medición posterior a `date_time` de la
  alerta para ese dispositivo, y de paso marca `ONLINE` el `device-status-logs` más reciente de
  ese dispositivo.

Esta función se llama desde tres lugares: el ciclo de `mock/live-measurements.js` (después de
generar las mediciones de cada tick), `POST /api/homes/:id/devices` en `mock/server.js` (un
dispositivo re-vinculado puede tener mediciones frescas antes del próximo tick de `mock:live`), y
`GET /api/alerts` (para que la respuesta siempre refleje el estado más fresco posible aunque
`mock:live` no haya corrido todavía). `PATCH /api/alerts/:id` se mantiene en el servidor para un
eventual override manual de administrador, pero el frontend normal ya no lo llama.

## Vincular un dispositivo a una cuenta nueva

Los 9 dispositivos que crea `mock/seed.js` ya están vinculados a "Main House" y
"Southside Studio" — ahora mismo `db.json` tiene **0 dispositivos libres**, así que si
abrís el modal de vinculación tal cual sin hacer nada más, no vas a ver ningún código
sugerido. Paso a paso para probar el flujo completo:

1. Generá dispositivos sin vincular ("libres"), con un código de 6 caracteres cada uno:
   ```bash
   npm run mock:add-spares              # agrega 12 dispositivos libres (por defecto)
   npm run mock:add-spares -- --count 20
   npm run mock:add-spares -- --force   # agrega más aunque ya existan suficientes libres
   ```
   Es seguro volver a correrlo: rechaza agregar más cuando ya hay suficientes libres
   (salvo con `--force`). Los códigos son deterministas. **Si `npm run mock` ya estaba
   corriendo, reinicialo** — el servidor carga `devices`/`device-homes` una sola vez al
   arrancar, así que no ve dispositivos libres agregados después (a diferencia de
   `measurements`/`alerts`/`device-status-logs`, que sí se recargan solos, ver
   "Telemetría continua" más arriba).
2. Levantá la app (`npm run dev:full`, o `npm run dev` + `npm run mock` por separado) e
   iniciá sesión como `owner@demo.com` / `Demo1234*`.
3. Entrá a **"Downtown Apartment"** (`/homes/HOM0000002` en un `db.json` recién sembrado) —
   es el único hogar sembrado sin ningún dispositivo, a propósito, ideal para este flujo.
   `owner@demo.com` es OWNER ahí, lo cual importa: el botón de vincular **solo lo ve el
   OWNER de ese hogar, no un MEMBER** — si probás con `member@demo.com` no vas a
   encontrarlo.
4. Abrí la pestaña **"Dispositivos"**.
5. Hacé clic en **"Vincular dispositivo"** (arriba a la derecha, o el mismo botón que
   aparece en el estado vacío de la lista).
6. En el modal aparece **"Dispositivos de prueba disponibles"**: una lista con los
   códigos que acaba de generar `mock:add-spares` (viene de `GET /api/devices/spare`,
   ver más abajo). Hacé clic en cualquiera para autocompletar el campo del código — o
   escribilo a mano, son 6 caracteres (ej. `A9YERH`).
7. Clic en **"Continuar"**. Como el hardware real no tiene pantalla ni forma de saber
   qué electrodoméstico está monitoreando, el modal pide ahora un paso más: elegí un
   **electrodoméstico** (grilla de íconos) y una **ubicación** (selector) — recién con
   ambos elegidos se habilita "Continuar" de nuevo.
8. El modal llama a `POST /api/homes/:homeId/devices` con
   `{ device_code, appliance_type_id, location }`; si el código existe y no está
   vinculado a otro hogar, confirma "¡Dispositivo vinculado!" con el electrodoméstico y
   la ubicación que acabás de elegir — clic en "Finalizar" para cerrar el modal y ver el
   dispositivo ya en la lista.

Esa lista de códigos también es visible sin pasar por el modal, directamente desde la
terminal — la consola de `npm run mock:add-spares` los imprime al terminar. Ojo: esos
códigos ya **no** vienen con un electrodoméstico/ubicación de muestra (ver "Decisiones
de diseño" más abajo) — un dispositivo libre es hardware sin instalar todavía.

## Usuarios de prueba

Todos los usuarios sembrados comparten la contraseña `Demo1234*`.

| Email | Estado | Notas |
|---|---|---|
| `owner@demo.com` | ACTIVE | OWNER de "Main House" y "Downtown Apartment", MEMBER de "Southside Studio" |
| `member@demo.com` | ACTIVE | MEMBER (solo lectura) de "Main House" |
| `blocked@demo.com` | BLOCKED | `failed_login_attempts` ya en el máximo (3) |
| `unverified@demo.com` | INACTIVE | `email_verified: false`, nunca inició sesión |
| `owner2@demo.com` | ACTIVE | OWNER de "Southside Studio" |

Hogares: "Main House" y "Southside Studio" tienen dispositivos vinculados; "Downtown
Apartment" no tiene ninguno intencionalmente, para ejercitar la UI de estado vacío.

## Tabla del MER → colección → endpoint

| Tabla del MER | Colección en `db.json` | Endpoint(s) típico(s) |
|---|---|---|
| `person` | `persons` | via composición en `user`, sin ruta directa |
| `user` | `users` | `/api/auth/*`, `/api/users/me` |
| `user_configuration` | `user-configurations` | `/api/users/me/configuration` |
| `password_reset_token` | `password-reset-tokens` | `/api/auth/recover-password`, `/api/auth/reset-password` |
| `user_session` | `user-sessions` | `/api/auth/login`, `/refresh`, `/logout` |
| `security_configuration` | `security-configurations` | leído internamente por el servidor (p. ej. `MAX_FAILED_LOGIN_ATTEMPTS`) |
| `password_policy` | `password-policies` | leído internamente por el servidor |
| `login_error_log` | `login-error-logs` | escrito en login fallido, solo lectura vía API (405 en escritura) |
| `system_role` | `system-roles` | `/api/auth/me` (roles) |
| `user_system_role` | `user-system-roles` | `/api/auth/me` (roles) |
| `permission` | `permissions` | `/api/auth/me` (permisos), solo lectura vía API (405 en escritura) |
| `system_role_permission` | `system-role-permissions` | `/api/auth/me` (permisos) |
| `audit_log` | `audit-logs` | escrito internamente, solo lectura vía API (405 en escritura) |
| `home_type` | `home-types` | `/api/catalogs/home-types` |
| `home` | `homes` | `/api/homes`, `/api/homes/:id` |
| `home_thresholds` | `home-thresholds` | `/api/homes/:id/thresholds` |
| `user_home` | `user-homes` | `/api/homes` (role/favorite), `/api/homes/:id/members`, `/join`, `/leave`, `/favorite` |
| `appliance_type` | `appliance-types` | `/api/catalogs/appliance-types` |
| `device` | `devices` | `/api/homes/:id/devices` |
| `device_status_log` | `device-status-logs` | compuesto en `/api/homes/:id/devices` |
| `device_home` | `device-homes` | tabla de enlace, sin ruta directa |
| `measurement` | `measurements` | compuesto en `/api/homes/:id/consumption/*`, solo lectura vía API (405 en escritura) |
| `consumption_level` | `consumption-levels` | usado para calcular la `severity` de alertas en el servidor, nunca persistido |
| `alert` | `alerts` | `/api/alerts` |
| `recommendation` | `recommendations` | `/api/recommendations` |

## Endpoints

Todas las rutas están montadas bajo `/api`. Cada respuesta de error tiene la forma
`{ status, code, message }`.

**Públicos** (no se necesita header `Authorization`):
`POST /auth/register`, `/auth/verify-email`, `/auth/login`, `/auth/refresh`,
`/auth/logout`, `/auth/recover-password`, `/auth/reset-password`,
`GET /catalogs/home-types`, `GET /catalogs/appliance-types`.

**Todo lo demás requiere `Authorization: Bearer <accessToken>`:**
`GET /auth/me`; `GET/POST /homes`, `GET/PUT/DELETE /homes/:id`,
`POST /homes/join`, `DELETE /homes/:id/leave`, `PATCH /homes/:id/favorite`,
`GET/POST /homes/:id/members`, `DELETE /homes/:id/members/:userId`,
`GET/PUT /homes/:id/thresholds`, `GET/POST /homes/:id/devices`,
`DELETE /homes/:id/devices/:deviceId`,
`GET /homes/:id/consumption/{summary,hourly,distribution,history}`,
`GET/PATCH /alerts`, `GET/PATCH /recommendations`,
`GET/PUT /users/me`, `GET/PUT /users/me/configuration`.

`GET /homes/:id` (consulta de un hogar individual, a diferencia del endpoint de lista) también
compone un objeto `owner: { name, last_name, email, cellphone }` a partir de `person`/`user`
— usado por la pestaña "Hogar" del frontend para mostrar a quién contactar.

**Conveniencias de prueba (solo en el mock, sin equivalente en el backend real):**
`GET /devices/spare` lista el código de cada dispositivo sin vincular, para que un tester pueda
verlo sin abrir `db.json` — ver "Vincular un dispositivo a una cuenta nueva" más arriba. Un
backend real nunca expondría esto: "todos los dispositivos sin reclamar en todo el sistema" no
es algo que ningún usuario autenticado debería poder listar — el descubrimiento real de
dispositivos ocurre por red local o BLE, no por una consulta a la base de datos compartida. El
flujo real de vinculación del frontend (escribir un código de 6 caracteres) funciona exactamente
como funcionará en producción; este endpoint es solo un atajo para *conocer* un código de prueba
válido, superpuesto sobre ese flujo real, no un reemplazo de él.

**Deliberadamente no implementado** (no existe ningún endpoint — el frontend no llama a ninguno
de estos, por diseño, no por omisión):
- Eliminar una alerta o recomendación, o un estado de "invitación pendiente" para
  `POST /homes/:id/members` — invitar a un usuario existente lo agrega como `MEMBER`
  inmediatamente, ya que `user_home` no tiene columna de estado "pendiente" para representar
  una invitación no aceptada.
- Cambiar la propia contraseña estando autenticado, o eliminar la cuenta — solo el flujo de
  contraseña olvidada (`/auth/recover-password` + `/auth/reset-password`) puede cambiar una
  contraseña.
- Subir una foto de perfil — `person.profile_image` es un campo de tipo cadena (URL) sin ninguna
  ruta de subida de archivos detrás; el selector de foto del frontend es una vista previa solo
  local (`URL.createObjectURL`) que nunca se envía al servidor. Ver `Account.jsx`.

**Passthrough de solo lectura** (router genérico de json-server, solo GET — cualquier otra
colección no cubierta por un endpoint derivado de los anteriores, incluyendo `measurements`,
`audit-logs`, `login-error-logs` y `permissions`): cualquier petición que no sea `GET` a este
punto recibe un `405` genérico, en vez de hacer una lista blanca de qué colecciones crudas son
escribibles. Las filas con soft-delete (`deleted_at != null`) se filtran de toda respuesta,
tanto de listas como de recurso individual, incluyendo este router genérico.

## Autenticación y guardas

- **Token de acceso**: un JWT (`mock/lib/auth.js`, secreto solo de desarrollo, nunca usado fuera
  de este mock), con vida útil tomada de
  `security-configurations.ACCESS_TOKEN_EXPIRATION_MINUTES` (15 min por defecto).
- **Token de refresco**: una cadena aleatoria opaca almacenada en `user-sessions`, no un JWT —
  verificado contra `revoked` y `expiration_at` en `/auth/refresh` (vida útil tomada de
  `SESSION_EXPIRATION_MINUTES`, 30 días). Refrescar no rota el token de refresco, solo emite un
  nuevo token de acceso — la opción más simple que igual satisface las dos verificaciones
  requeridas.
- **Token de restablecimiento de contraseña**: un código numérico de 6 dígitos (no una cadena
  aleatoria larga), para que encaje en el campo de entrada estilo OTP de la pantalla de
  recuperación de contraseña del frontend. `POST /auth/recover-password` lo devuelve directamente
  en el cuerpo de la respuesta — solo en el mock, ya que no hay entrega real de correo; el
  backend real lo enviaría por email. El frontend lo muestra en pantalla como pista "solo para
  pruebas" por la misma razón.
- **Manejo de fallos de login**: una contraseña incorrecta incrementa `failed_login_attempts` y
  registra una fila en `login-error-logs`; al llegar a `MAX_FAILED_LOGIN_ATTEMPTS` el `status`
  pasa a `BLOCKED` (ese intento concreto sigue devolviendo 401 — el 423 solo aparece en el
  *siguiente* intento, ya que las credenciales eran incorrectas en el que disparó el bloqueo).
  Orden de verificaciones: email desconocido / `BLOCKED` (423) / email no verificado o
  `INACTIVE` (403) / contraseña incorrecta (401).
- **Guarda de pertenencia al hogar** (`requireHomeMember`): 404 si el hogar en sí no existe,
  403 si existe pero quien llama no está en `user-homes` para él — alineado con los dos estados
  vacíos distintos del frontend (Fase 4). Adjunta `req.home` y `req.homeRole`.
- **Guarda de propietario del hogar** (`requireHomeOwner`): debe ejecutarse después de
  `requireHomeMember`; 403 si `req.homeRole !== "OWNER"`. Se usa para actualizar o eliminar el
  hogar, umbrales, vincular o desvincular dispositivos, invitar o expulsar miembros.
- **Roles y permisos globales** (tablas `system-role` / `permission`) son independientes del rol
  por hogar `OWNER`/`MEMBER` y no son los que controlan las acciones de escritura con alcance de
  hogar — esas las controlan las guardas de hogar descritas arriba.
- **Reincorporación tras abandonar**: `POST /homes/join` y `POST /homes/:id/members` reactivan
  una fila de `user-homes` con soft-delete anterior para ese par (usuario, hogar) en vez de
  insertar una nueva, para evitar un id compuesto duplicado.
- **Particularidad de lowdb v1**: `db.get(colección).push(fila)` es una cadena lodash perezosa
  — no hace nada hasta que se termina con `.value()` (o `.write()`). Cada inserción en
  `mock/server.js` termina con uno de los dos; si agregas una nueva, no lo olvides (una inserción
  descartada silenciosamente es muy fácil de pasar por alto — la petición igual devuelve 200/201
  con un id que parece válido).

## Decisiones de diseño (documentadas una vez, aplicadas en todas partes)

- **Formato de IDs** (`mock/lib/ids.js`): un prefijo de 3 letras + una secuencia de 7 dígitos
  con ceros a la izquierda por colección, p. ej. `USR0000001`, `HOM0000001`, `DEV0000001`,
  `MSR0000001`. Cada fila también lleva un campo `id` igual a su propia PK (p. ej.
  `{ "id": "HOM0000001", "id_home": "HOM0000001", ... }`) porque json-server enruta por `id`.
- **Tablas con PK compuesta** (`user-homes`, `device-homes`, `user-system-roles`,
  `system-role-permissions`): `id` es `"<idPadreA>_<idPadreB>"`, p. ej.
  `"USR0000001_HOM0000001"`.
- **Soft delete**: cada fila tiene `created_at`/`updated_at`/`deleted_at`. Las filas activas
  tienen `deleted_at: null`. La API nunca devuelve filas con `deleted_at` distinto de null, y
  las peticiones `DELETE` marcan `deleted_at` en vez de eliminar la fila (aplicado en
  `mock/server.js`, Fase 2).
- **`password_hash` / `password_plain`**: `password_hash` es una cadena de marcador de
  posición cosmético, nunca verificada realmente. `password_plain` es **solo del mock** — el
  endpoint de login compara contra él directamente. El backend real nunca tendrá una columna
  `password_plain`; este campo no debe filtrarse en ninguna respuesta de la API que el frontend
  consuma como si fuera real.
- **Semántica de `stored_energy`**: un contador de **por vida** que aumenta monotónicamente en
  kWh por dispositivo (como un medidor de la empresa eléctrica), no un valor que se resetea a
  diario. Consumo en cualquier período = `stored_energy` al final del período menos
  `stored_energy` al inicio. `active_power` (W) es el consumo instantáneo en esa marca de
  tiempo — nunca mezclar las dos unidades.
- **`consumption_level.min_limit` / `max_limit`**: elegidos como **kWh diarios absolutos**
  (no un porcentaje del umbral propio del hogar), porque permite al servidor clasificar una
  medición sin cruzar con `home_thresholds`. Los rangos no se solapan y no tienen huecos:
  LOW `[0,5)`, MEDIUM `[5,15)`, HIGH `[15,30)`, CRITICAL `[30, ∞)`. El backend real puede
  preferir un cálculo relativo al hogar — esta es una simplificación del mock, aislada en esta
  sola tabla.
- **`alert.severity` nunca se persiste.** La tabla `alert` no tiene columna severity;
  `mock/server.js` la calcula desde `consumption_level_id` (para alertas `THRESHOLD`) o desde
  la regla de `CONNECTIVITY` al servir `GET /api/alerts` (Fase 2).
- **Resolución del historial de mediciones** (`mock/seed.js`): para mantener `db.json` bien
  por debajo de un tamaño razonable y aun así cubrir un año completo, cada dispositivo recibe
  tres niveles de resolución consecutivos, del más antiguo al más reciente: días 365–31 atrás a
  1 muestra/día, horas 720–49 atrás (~día 30 a ~día 2) a 1 muestra/hora, y las últimas 48h a
  1 muestra/15min. Resultado actual: ver la línea en consola impresa por `npm run mock:seed`. Si
  un cambio futuro empuja el archivo más allá de ~15MB, bajar todo a 1 muestra/hora en primer
  lugar.
- **Las columnas `*_type.name` almacenan una clave estable en minúsculas** (p. ej. `"fridge"`,
  `"house"`), no texto de visualización — el frontend resuelve la etiqueta real a través de i18n
  usando esa clave, siguiendo la convención ya establecida en
  `src/features/DetailHome/shared/deviceTypes.js`. Todo lo demás que llega a la UI como texto
  libre (excepto `message_key`, que también es una clave de i18n) se almacena como datos
  planos.
- **`device.location`** usa las mismas claves de habitación ya definidas en
  `src/i18n/locales/*/devices.json` (`kitchen`, `livingRoom`, `bedroom`, `laundryRoom`,
  `garage`, `other`) — lista centralizada en `mock/lib/rooms.js` (mock) y
  `src/features/DetailHome/shared/roomTypes.js` (frontend).
- **`device.appliance_type_id` y `device.location` se asignan al vincular, no al crear
  el dispositivo.** El hardware real no tiene pantalla ni forma de saber qué
  electrodoméstico está monitoreando — eso solo lo sabe quien lo instala. Por eso un
  dispositivo libre (`mock/add-spare-devices.js`) nace con ambos campos en `null`, y
  `POST /api/homes/:id/devices` (`mock/server.js`) los exige y los persiste recién en
  ese momento, en base a lo que la persona eligió en `LinkDeviceModal`. Esto aplica
  igual al reactivar un vínculo (`device-homes` con soft-delete previo): se trata como
  una instalación nueva, así que la asignación de esa petición siempre pisa la anterior.
