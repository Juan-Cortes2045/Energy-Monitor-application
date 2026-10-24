# Monitor de Consumo Electrico

## Integrantes:
- Juan Esteban Cortes Parra
-  Miguel Angel Garcia Artunduaga

## Programa de formacion
Analisis y desarrollo de software(ADSO)
## Ficha:
3145556

## Integración con el backend

1. Levanta los servicios: el servicio de seguridad (`:8082`), energy-monitor-backend (`:8083`), el de dispositivos (`:8084`) y delante el API gateway (`http://localhost:8080`, ver su README). La web solo habla con el gateway.
2. La web llama siempre a `/api` en su propio origen: en desarrollo el servidor de Vite lo reenvía al gateway (`vite.config.js`) y en la pila de Docker lo hace nginx. Así no hace falta CORS y las cookies de la sesión funcionan igual en los dos modos.
3. Copia `.env.example` a `.env.local` si el gateway no está en `http://localhost:8080` (`VITE_DEV_API_TARGET`).
   Para el botón "Continuar con Google" pon en `.env.local` `VITE_GOOGLE_CLIENT_ID` (el mismo ID de cliente que `GOOGLE_CLIENT_ID` del servicio de seguridad; ver su README, "Sign in with Google"). Sin él, el botón no se muestra.
4. `npm install && npm run dev` → `http://localhost:5173`.
5. Comprobación: `npm test` y `npm run build`.

## Vincular dispositivos (Bluetooth)

En **Hogar → Dispositivos → Vincular dispositivo** (solo el propietario) la web encuentra el módulo por **Web Bluetooth**, lee las redes Wi-Fi que ve, lo registra en el backend y le envía red, servidor y credenciales. Pasos del módulo y del broker: `devices/README.md`.

- **Navegadores:** Chrome o Edge en computador y Chrome en Android. Safari (iPhone) y Firefox no tienen Web Bluetooth: ahí se usa el portal Wi-Fi `EnergyMonitor-Setup` del módulo.
- **Solo en `https://` o `http://localhost`.** Si abres la web por la IP de la red (`http://192.168.x.x:5173`) el navegador desactiva el Bluetooth.
- **Linux:** Chrome trae Web Bluetooth apagado. Activa `chrome://flags/#enable-experimental-web-platform-features`, pulsa *Relaunch* y vuelve a abrir la web. El adaptador debe estar encendido (`bluetoothctl show`).
- El backend debe tener `DEVICE_MQTT_PUBLIC_HOST` (IP LAN del PC o dominio del broker); sin él la vinculación avisa de que falta el servidor.

## Administración (rol global ADMIN)

Una cuenta con el rol global `ADMIN` solo ve la administración. Es distinto de ser propietario o miembro de un hogar: un administrador no ve hogares de los que no es miembro. Usa una cuenta dedicada para administrar y otra normal para tus hogares.

- **Menú del administrador:** **Administración**, **Notificaciones** y **Ajustes**. Al iniciar sesión entra directo a Administración (`/admin/users`); Inicio, Hogares y Favoritos no aparecen y sus rutas lo devuelven a Administración. En Ajustes ve idioma, tema y ayuda (las preferencias de correo y push son de las alertas de hogares).
- **Administración:** buscar cuentas por nombre o correo, ver su estado, roles globales, fecha de registro y último acceso; cambiar el estado (Activa, Inactiva, Bloqueada) y dar o quitar el rol de administrador. Bloquear y quitar el rol piden confirmación. Sobre la propia cuenta no hay acciones.
- **Notificaciones del administrador:** cuentas nuevas y los cambios de estado o de rol que hicieron los demás administradores, con insignia de no leídas en el menú (se consulta cada 30 s). Se marcan como leídas y se eliminan. Solo se ven en la web: no llegan por correo ni push.
- **Permisos:** al iniciar sesión (y al recargar) la web pide `GET /auth/permissions` y guarda los códigos en la sesión (`USER.READ`, `USER.MANAGE`, `ROLE.MANAGE`). Solo deciden qué se muestra; el backend vuelve a comprobarlos en cada petición y responde 403 si faltan.
- **Primer administrador:** ninguna cuenta lo es al instalar. Regístrala en la web y asígnale el rol una vez en la base de datos (ver "Administrators and global roles" en el README del backend); después se gestiona desde esta pantalla. Tras asignarlo, cierra sesión y vuelve a entrar.
- **Pendiente:** gestionar el soporte y la documentación desde Ajustes, y avisos de administrador por correo o push.
- La app móvil no tiene pantallas de administración.

## Notificaciones

- **En la web:** insignia con las alertas pendientes en el menú, contador en el título de la pestaña y aviso emergente cuando llega una nueva (se consulta cada 30 s).
- **Correo y push:** se configuran en **Configuración → Notificaciones**. El push usa el service worker `public/sw.js` y llega aunque la pestaña esté cerrada. Necesita las claves VAPID en el `.env` del backend (`NOTIFICATION_VAPID_*`) y, como el Bluetooth, `https://` o `localhost`. En iPhone solo funciona con la web instalada en la pantalla de inicio.
- Las alertas de consumo y de desconexión se resuelven solas cuando el sistema detecta que pasó; los avisos (dispositivo vinculado) y las recomendaciones se marcan como leídos. Lo resuelto o leído se puede eliminar.

## Datos simulados

Todo lo que se ve sale del backend salvo las **recomendaciones** de la página de Notificaciones, porque el módulo `recommendation` del backend aún no existe.

**Recuperar contraseña en local:** el backend envía el código por correo; con Mailpit (ver README del backend) los mensajes se ven en http://localhost:8025.

**Sesión:** los tokens nunca pasan por el código de la web. El servicio de seguridad los entrega en cookies HttpOnly (`X-Session-Transport: cookie`) que ningún script puede leer, así que un XSS no puede robar la sesión. `localStorage` solo guarda la cuenta, el perfil, los permisos y el id de la sesión. Toda petición lleva `X-Requested-With: XMLHttpRequest`, sin la cual el gateway no usa la cookie (protección CSRF). Al vencer el access token, `httpClient` renueva la sesión con la cookie de refresh (una sola vez a la vez, también entre pestañas). Al cerrar sesión se da de baja el push de este navegador y el backend borra las cookies.
