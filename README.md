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
5. `npm install && npm run dev`.

**Recuperar contraseña en local:** el backend envía el código por correo; con Mailpit (ver README del backend) los mensajes se ven en http://localhost:8025.

**Tokens:** el access y el refresh token se guardan en `localStorage`. Es una limitación conocida: cualquier XSS podría leerlos.
