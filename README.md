# Monitor de Consumo Electrico

## Integrantes:
- Juan Esteban Cortes Parra
-  Miguel Angel Garcia Artunduaga

## Programa de formacion
Analisis y desarrollo de software(ADSO)
## Ficha:
3145556

## Integración con el backend

1. Levanta el backend (`http://localhost:8080`, ver su README).
2. En el backend, define `SECURITY_CORS_ALLOWED_ORIGINS` con el origen de Vite, por ejemplo `http://localhost:5173`. Sin esto el navegador bloquea las peticiones.
3. Opcional: `SECURITY_CORS_EXPOSED_HEADERS=Retry-After` para que el frontend lea la espera exacta del límite de intentos (si no, asume 15 minutos, que es el valor fijo del backend).
4. Copia `.env.example` a `.env.local` si el backend no está en el puerto por defecto (`VITE_API_BASE_URL`).
   Para el botón "Continuar con Google" pon en `.env.local` `VITE_GOOGLE_CLIENT_ID` (el mismo ID de cliente que `GOOGLE_CLIENT_ID` del backend; ver su README, "Sign in with Google"). Sin él, el botón no se muestra.
5. `npm install && npm run dev` → `http://localhost:5173`.
6. Comprobación: `npm test` y `npm run build`.

## Vincular dispositivos (Bluetooth)

En **Hogar → Dispositivos → Vincular dispositivo** (solo el propietario) la web encuentra el módulo por **Web Bluetooth**, lee las redes Wi-Fi que ve, lo registra en el backend y le envía red, servidor y credenciales. Pasos del módulo y del broker: `devices/README.md`.

- **Navegadores:** Chrome o Edge en computador y Chrome en Android. Safari (iPhone) y Firefox no tienen Web Bluetooth: ahí se usa el portal Wi-Fi `EnergyMonitor-Setup` del módulo.
- **Solo en `https://` o `http://localhost`.** Si abres la web por la IP de la red (`http://192.168.x.x:5173`) el navegador desactiva el Bluetooth.
- **Linux:** Chrome trae Web Bluetooth apagado. Activa `chrome://flags/#enable-experimental-web-platform-features`, pulsa *Relaunch* y vuelve a abrir la web. El adaptador debe estar encendido (`bluetoothctl show`).
- El backend debe tener `DEVICE_MQTT_PUBLIC_HOST` (IP LAN del PC o dominio del broker); sin él la vinculación avisa de que falta el servidor.

## Notificaciones

- **En la web:** insignia con las alertas pendientes en el menú, contador en el título de la pestaña y aviso emergente cuando llega una nueva (se consulta cada 30 s).
- **Correo y push:** se configuran en **Configuración → Notificaciones**. El push usa el service worker `public/sw.js` y llega aunque la pestaña esté cerrada. Necesita las claves VAPID en el `.env` del backend (`NOTIFICATION_VAPID_*`) y, como el Bluetooth, `https://` o `localhost`. En iPhone solo funciona con la web instalada en la pantalla de inicio.
- Las alertas de consumo y de desconexión se resuelven solas cuando el sistema detecta que pasó; los avisos (dispositivo vinculado) y las recomendaciones se marcan como leídos. Lo resuelto o leído se puede eliminar.

## Datos simulados

Todo lo que se ve sale del backend salvo las **recomendaciones** de la página de Notificaciones, porque el módulo `recommendation` del backend aún no existe.

**Recuperar contraseña en local:** el backend envía el código por correo; con Mailpit (ver README del backend) los mensajes se ven en http://localhost:8025.

**Tokens:** el access y el refresh token se guardan en `localStorage`. Es una limitación conocida: cualquier XSS podría leerlos.
