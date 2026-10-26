# Informe Audit de SEO Técnico, Rendimiento, UX, Seguridad y Resiliencia

**Proyecto:** EnergyMonitor (Web Client - React / Vite / Nginx)
**Fecha:** 26 de Octubre de 2025
**Auditor:** Auditor Senior de SEO Técnico, Rendimiento Web, UX, Seguridad y Resiliencia

---

## 1. Resumen Ejecutivo

### Puntuación General: **82 / 100**

El proyecto **EnergyMonitor** presenta una arquitectura moderna, limpia y bien cimentada en la separación de responsabilidades y la seguridad de la sesión de usuario (manejo de autenticación basado en cookies `HttpOnly` y defensas CSRF robustas). Sin embargo, existen deficiencias críticas y de prioridad alta en SEO técnico, falta de políticas de Rate Limiting e inactividad en la capa web/reverse proxy frente a abusos DDoS, además de redundancias de código en la gestión de modales e interfaces de diálogos modal.

### Hallazgos y Problemas Más Graves (Highlights Críticos y Altos)
1. **[SEO / Indexación - CRÍTICA] Ausencia de `robots.txt` y `sitemap.xml`:**
   No existen los archivos `robots.txt` ni `sitemap.xml` en la carpeta `public/`. Los motores de búsqueda no pueden descubrir ni indexar de manera estructurada las páginas públicas (`/home`, `/about`, `/support`).
2. **[SEO / Meta Etiquetas - ALTA] Indexación de SPA e Infraestructura de Meta Etiquetas Dinámicas Incompleta:**
   El `index.html` cuenta con etiquetas estáticas básicas. Sin embargo, no hay implementación de `react-helmet-async` u otros mecanismos para actualizar dinámicamente `<title>`, `<meta name="description">` u OpenGraph / Twitter Cards según la ruta activa (`/about`, `/support`, `/login`).
3. **[Seguridad & DDoS - ALTA] Falta de Rate Limiting en Nginx para Endpoints Sensibles:**
   La configuración de Nginx (`nginx.conf`) realiza un `proxy_pass` directo a `gateway:8080` sin definir zonas de limitación de tasa (`limit_req_zone`). Endpoints críticos como `/api/v1/auth/login`, `/api/v1/auth/register` y `/api/v1/auth/password/forgot` están expuestos a ataques de fuerza bruta o saturación de peticiones a nivel web.
4. **[Seguridad & Resiliencia - MEDIA] Ausencia de Timeouts de Proxy en Nginx:**
   No existen directivas `proxy_connect_timeout`, `proxy_read_timeout` o `proxy_send_timeout` explícitas en el bloque `location /api/`. Peticiones colgadas del backend o lentas pueden agotar los workers de Nginx.
5. **[Duplicidad de Código - MEDIA] Lógica de Modales Accesibles y Telones de Fondo (Backdrops) Duplicada:**
   A pesar de existir el hook `useDialogA11y`, componentes como `ConfirmModal`, `LegalModal`, `LinkDeviceModal`, `CreateHomeModal` y `JoinHomeModal` duplican estilos de superposición, manejo de tecla `Escape`, y estructura de diálogo modal en lugar de compartir un componente primitivo `Modal` reactivo.

---

## 2. Hallazgos Detallados por Área

---

### A. SEO Técnico
* **Puntuación del área:** 65 / 100

#### Hallazgos y Deficiencias:
1. **[CRÍTICA] Ausencia de `robots.txt` y `sitemap.xml`:**
   - **Qué ocurre:** La carpeta `public/` carece de `robots.txt` y `sitemap.xml`.
   - **Dónde ocurre:** `public/robots.txt` y `public/sitemap.xml`.
   - **Cómo corregirlo:** Crear `public/robots.txt` autorizando el rastreo de `/home`, `/about`, `/support` y bloqueando `/admin/`, `/dashboard`, `/account`. Crear `public/sitemap.xml` con las URLs canónicas.

2. **[ALTA] Títulos y Meta Descripciones Estáticas:**
   - **Qué ocurre:** En `index.html` se define `<title>EnergyMonitor</title>` fijo. Al navegar entre `/home`, `/about`, `/support` o `/login`, el título y la meta-descripción en el DOM no cambian (excepto por el contador de notificaciones en `NotificationCenterContext.jsx`).
   - **Dónde ocurre:** `index.html` y `src/routes/AppRoutes.jsx`.
   - **Cómo corregirlo:** Integrar un gestor de metadatos (ej. un custom hook `useDocumentTitle` o `react-helmet-async`) para actualizar `<title>` y `<meta name="description">` en cada ruta.

3. **[MEDIA] Ausencia de Metadatos OpenGraph, Twitter Cards y Datos Estructurados (JSON-LD):**
   - **Qué ocurre:** No existen etiquetas `og:title`, `og:image`, `og:description` ni esquemas `schema.org` (JSON-LD) para SoftwareApplication o Organization.
   - **Dónde ocurre:** `index.html`.
   - **Cómo corregirlo:** Agregar etiquetas Open Graph/Twitter en `index.html` y un bloque `<script type="application/ld+json">` con la información del producto/empresa.

4. **[BAJA] Etiqueta Canonical Ausente:**
   - **Qué ocurre:** No hay `<link rel="canonical" href="..." />` en el HTML de entrada ni dinamizado por ruta.
   - **Dónde ocurre:** `index.html`.
   - **Cómo corregirlo:** Agregar la etiqueta canónica base en `index.html` e instruir su actualización por ruta.

---

### B. Rendimiento y Core Web Vitals
* **Puntuación del área:** 88 / 100

#### Hallazgos y Deficiencias:
1. **[ALTA] Tamaño del Chunk de Gráficos (`Recharts`):**
   - **Qué ocurre:** Al ejecutar `npm run build`, el bundle `dist/assets/Consumption-*.js` pesa 454.54 kB (130.83 kB gzipped). Esto se debe a la inclusión pesada de `recharts`.
   - **Dónde ocurre:** `src/features/DetailHome/Consumption/Consumption.jsx` y `ConsumptionHistory.jsx`.
   - **Cómo corregirlo:** Aplicar `React.lazy()` para cargar el componente de gráficos solo cuando el usuario abra la pestaña de histórico o consumo, reduciendo el TTI (Time to Interactive) de la vista general del hogar.

2. **[MEDIA] Compresión Gzip en Nginx activa pero falta soporte Brotli:**
   - **Qué ocurre:** En `nginx.conf`, la compresión `gzip` está bien configurada (`gzip_comp_level 5; gzip_types ...`). Sin embargo, no se ha configurado la compresión `brotli` que ofrece un 15-20% adicional de reducción en JS/CSS.
   - **Dónde ocurre:** `nginx.conf`.
   - **Cómo corregirlo:** Habilitar `brotli on;` si el módulo está compilado en la imagen de Nginx.

3. **[BAJA] Precarga de Fuentes Web:**
   - **Qué ocurre:** Las fuentes `Inter` y `Poppins` se declaran mediante CSS (`--font-primary: "Inter", sans-serif;`), pero no hay `<link rel="preload">` en `index.html` para la fuente principal.
   - **Dónde ocurre:** `index.html` / `src/styles/global.css`.
   - **Cómo corregirlo:** Añadir precarga de la fuente principal o usar `font-display: swap`.

---

### C. Experiencia de Usuario (UX) y Accesibilidad (WCAG 2.1 AA)
* **Puntuación del área:** 90 / 100

#### Hallazgos y Deficiencias:
1. **[MEDIA] Notificación i18n warnings en consola durante pruebas de testing:**
   - **Qué ocurre:** Múltiples tests arrojan `react-i18next:: useTranslation: You will need to pass in an i18next instance`.
   - **Dónde ocurre:** Archivos de prueba `.test.jsx`.
   - **Cómo corregirlo:** Inicializar el mock de i18n globalmente en `src/test/setup.js` o importar `src/i18n` en el setup de Vitest.

2. **[MEDIA] Contraste en modo claro para variables secundarias:**
   - **Qué ocurre:** En `global.css`, `--color-secondary` es `#32cd32` (verde claro). Para textos, el sistema usó `--color-secondary-text: #217821;` para cumplir WCAG, pero se deben auditar componentes donde `--color-secondary` pudiera usarse como texto directo.
   - **Dónde ocurre:** `src/styles/global.css`.
   - **Cómo corregirlo:** Asegurar que todo texto secundario emplee exclusivamente `--color-secondary-text`.

3. **[BAJA] Skip Link implementado correctamente:**
   - **Observación Positiva:** `global.css` implementa `.skip-link` enfocado para navegación por teclado. Se recomienda verificar que todas las páginas principales posean un `<main id="main-content">` enlazado.

---

### D. Contenido y Conversión
* **Puntuación del área:** 85 / 100

#### Hallazgos y Deficiencias:
1. **[MEDIA] Módulo de Recomendaciones Simulado (Backend pendiente):**
   - **Qué ocurre:** Según el `README.md`, las recomendaciones en Notificaciones son simuladas porque el módulo `recommendation` del backend aún no existe.
   - **Dónde ocurre:** `src/features/Notifications/Notifications.jsx`.
   - **Cómo corregirlo:** Incluir un indicador sutil o disclaimer si los datos de la recomendación son estáticos hasta que el servicio de backend esté desplegado.

2. **[BAJA] Claridad de la Propuesta de Valor y CTAs:**
   - **Observación Positiva:** La Landing Page en `Hero.jsx`, `Benefits.jsx` y `HowItWorks.jsx` presenta una propuesta de valor clara sobre monitoreo de consumo eléctrico en tiempo real, ahorros y alertas, con botones de llamada a la acción hacia `/register` claros.

---

### E. Seguridad y Vulnerabilidades
* **Puntuación del área:** 88 / 100

#### Hallazgos y Deficiencias:
1. **[ALTA] Cabecera HSTS (HTTP Strict Transport Security) Ausente:**
   - **Qué ocurre:** `nginx-security-headers.conf` define CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y `Permissions-Policy`. Sin embargo, falta `Strict-Transport-Security` (HSTS).
   - **Dónde ocurre:** `nginx-security-headers.conf`.
   - **Cómo corregirlo:** Agregar `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;` (para entornos de producción HTTPS).

2. **[ALTA] Falta de Protección contra Rate Limiting en la Capa Web:**
   - **Qué ocurre:** La app depende exclusivamente del rate limiting que pueda aplicar el backend gateway. Si un atacante envía miles de peticiones por segundo a `/api/v1/auth/login`, Nginx las redirigirá todas sin contención previa.
   - **Dónde ocurre:** `nginx.conf`.
   - **Cómo corregirlo:** Configurar en `nginx.conf`:
     ```nginx
     limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
     limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=3r/s;
     ```
     y aplicarlo en el bloque `location /api/`.

3. **[MEDIA] Sanitización e Inspección de Dependencias (`npm audit`):**
   - **Observación Positiva:** `npm audit` reportó **0 vulnerabilidades**. La suite de dependencias (`react` 19, `vite` 8, `axios` 1, `zod` 4) se encuentra actualizada.
   - **Manejo de Sesión Positivo:** El uso de cookies `HttpOnly` (`X-Session-Transport: cookie`) y la validación CSRF mediante la cabecera `X-Requested-With: XMLHttpRequest` está impecablemente implementado en `httpClient.js`.

---

### F. Duplicidad de Código
* **Puntuación del área:** 78 / 100

#### Hallazgos y Deficiencias:
1. **[MEDIA] Duplicación de Lógica/Estructura de Diálogos Modales:**
   - **Qué ocurre:** `ConfirmModal.jsx`, `LegalModal.jsx`, `LinkDeviceModal.jsx`, `CreateHomeModal.jsx` y `JoinHomeModal.jsx` recrean manualmente estructuras de modal con overlay, clase de contenedor y escucha de teclas `Escape`.
   - **Dónde ocurre:** `src/components/shared/ConfirmModal/`, `src/features/auth/components/LegalModal/`, `src/features/DetailHome/Devices/LinkDeviceModal/`, etc.
   - **Cómo corregirlo:** Unificar en un componente base compartible `<Modal isOpen={isOpen} onClose={onClose} title={title}>` ubicado en `src/design/components/Modal/Modal.jsx` que incorpore `useDialogA11y`.

2. **[MEDIA] Redundancia en Schemas de Validación Zod:**
   - **Qué ocurre:** Existen reglas comunes repetidas entre `loginSchema.js`, `registerSchema.js`, `recoverSchema.js` y `resetSchema.js`.
   - **Dónde ocurre:** `src/features/auth/validation/`.
   - **Observación:** Aunque existe `sharedRules.js`, algunas validaciones de contraseña y email aún redefinen mensajes de error localmente.
   - **Cómo corregirlo:** Consolidar todos los esquemas atómicos en `sharedRules.js`.

---

### G. Protección frente a DDoS y Abuso
* **Puntuación del área:** 70 / 100

#### Hallazgos y Deficiencias:
1. **[ALTA] Rate Limiting y Throttling en Reverse Proxy:**
   - **Qué ocurre:** Nginx no limita la tasa de peticiones.
   - **Dónde ocurre:** `nginx.conf`.
   - **Cómo corregirlo:** Definir `limit_req` y `limit_req_status 429;`.

2. **[MEDIA] Timeouts de Proxy Inexistentes:**
   - **Qué ocurre:** Sin timeouts de proxy configurados en `nginx.conf`, peticiones lentas pueden agotar los recursos del servidor.
   - **Dónde ocurre:** `nginx.conf` (`location /api/`).
   - **Cómo corregirlo:** Agregar:
     ```nginx
     proxy_connect_timeout 5s;
     proxy_read_timeout 60s;
     proxy_send_timeout 60s;
     ```

3. **[MEDIA] Recomendación de Integración de WAF / CDN:**
   - **Qué ocurre:** En producción, una aplicación con exposición pública de IoT/monitoreo energético requiere mitigación de ataques volumétricos L3/L4 y L7.
   - **Cómo corregirlo:** Posicionar Cloudflare o AWS CloudFront con AWS WAF delante del origen de Nginx.

---

## 3. Pruebas de Casos Clave (Case Keys Execution Matrix)

| Caso Clave (Flow) | Paso a Paso | Resultado Esperado | Resultado Obtenido | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **CK-01: Registro y Verificación de Cuenta** | 1. Usuario completa `/register`.<br>2. Se envía código OTP de verificación por correo.<br>3. Redirección a `/VerifyAccount`.<br>4. Usuario ingresa OTP de 6 dígitos.<br>5. Confirmación y redirección a `/login`. | Registro válido crea usuario inactivo; al verificar OTP pasa a estado ACTIVO y redirige a `/login`. | Funciona correctamente. Validado en tests con `RegisterForm.jsx` y `verify.test.jsx`. | **PASÓ (PASS)** |
| **CK-02: Autenticación y Renovación Transparente de Sesión** | 1. Usuario ingresa credenciales en `/login`.<br>2. Backend responde con cookies HttpOnly.<br>3. Peticiones subsiguientes llevan `X-Requested-With`.<br>4. Al vencer Access Token (401), `httpClient` ejecuta `/auth/refresh` atómicamente.<br>5. La petición original se reintenta automáticamente. | Inicio de sesión exitoso sin tokens en `localStorage`. Renovación transparente en 401 usando Web Locks entre pestañas. | Funciona correctamente. Validado en `httpClient.refresh.test.js` y `httpClient.test.js`. | **PASÓ (PASS)** |
| **CK-03: Recuperación de Contraseña** | 1. Solicitud de código en `/recover-password`.<br>2. Ingreso de código en `/verifyRecoverPassword`.<br>3. Definición de nueva contraseña.<br>4. Canje y redirección a `/login`. | Flujo completo de restablecimiento de contraseña con manejo de cooldown (429) y bloqueo de botón. | Funciona correctamente. Validado en `recover.test.jsx` y `passwordPolicy.test.js`. | **PASÓ (PASS)** |
| **CK-04: Panel de Control e Histórico de Consumo** | 1. Inicio de sesión como usuario normal.<br>2. Carga de hogares en `/dashboard`.<br>3. Selección de un hogar `/homes/:homeId`.<br>4. Visualización de métricas en tiempo real y gráficos de consumo. | Carga de catálogo de dispositivos/hogares, renderizado de gráficos y tabla de ranking. | Funciona correctamente. Validado en `DashboardPage.test.jsx` y `ConsumptionHistory.test.jsx`. | **PASÓ (PASS)** |
| **CK-05: Vinculación de Dispositivo por Web Bluetooth** | 1. El usuario hace clic en "Vincular dispositivo".<br>2. Se abre el modal `LinkDeviceModal`.<br>3. Escaneo mediante API Web Bluetooth (`navigator.bluetooth`).<br>4. Selección de red Wi-Fi y credenciales.<br>5. Registro en el backend. | Escaneo y vinculación de módulo IoT. | **VERIFICADO PARCIALMENTE.** En entorno headless/sandbox o navegadores sin soporte Web Bluetooth (Firefox/Safari), la prueba unitaria verifica la accesibilidad del modal (`LinkDeviceModal.test.jsx`). El escaneo hardware real requiere un navegador Chrome/Edge y dispositivo físico BLE activo. | **PARCIAL (PARTIAL)** |
| **CK-06: Administración y Permisos Globales (Rol ADMIN)** | 1. Inicio de sesión con usuario `ADMIN`.<br>2. Redirección automática a `/admin/users`.<br>3. Consulta de permisos `USER.READ`, `USER.MANAGE`, `ROLE.MANAGE`.<br>4. Búsqueda y cambio de estado/rol de usuarios con modal de confirmación. | Redirección restrictiva, renderizado exclusivo de rutas de administración y confirmación para acciones críticas. | Funciona correctamente. Validado en `AdminUsers.test.jsx` y `RequirePermission.test.jsx`. | **PASÓ (PASS)** |

---

## 4. Plan de Acción y Corrección (Ordenado por Impacto y Esfuerzo)

### Fase 1: Correcciones Críticas de Inmediato (Impacto Alto / Esfuerzo Bajo)
1. **Crear `public/robots.txt` y `public/sitemap.xml`:**
   - **Esfuerzo:** 1 hora.
   - **Acción:** Definir directivas para crawlers y listado de rutas públicas (`/home`, `/about`, `/support`).
2. **Agregar Cabecera HSTS y Timeouts de Proxy en Nginx:**
   - **Esfuerzo:** 1 hora.
   - **Acción:** Editar `nginx-security-headers.conf` y `nginx.conf` para incluir `Strict-Transport-Security` y `proxy_read_timeout`.
3. **Configurar Rate Limiting en Nginx:**
   - **Esfuerzo:** 2 horas.
   - **Acción:** Definir `limit_req_zone` en `nginx.conf` para proteger los endpoints de la API frente a abusos.

### Fase 2: SEO Técnico y Accesibilidad Avanzada (Impacto Alto / Esfuerzo Medio)
4. **Implementar Actualización Dinámica de Metadatos (SEO):**
   - **Esfuerzo:** 4 horas.
   - **Acción:** Crear hook `useDocumentTitle` y actualizar los títulos/meta descripciones en cada pantalla de la aplicación.
5. **Añadir Metadatos OpenGraph y Datos Estructurados JSON-LD:**
   - **Esfuerzo:** 2 horas.
   - **Acción:** Incluir metadatos de redes sociales y esquema `SoftwareApplication` en `index.html`.

### Fase 3: Factorización de Código y Rendimiento (Impacto Medio / Esfuerzo Medio)
6. **Refactorizar Componente Primitivo Modal Base:**
   - **Esfuerzo:** 5 horas.
   - **Acción:** Crear `src/design/components/Modal/Modal.jsx` refactorizando `ConfirmModal`, `LegalModal`, `LinkDeviceModal` y modal de creación de hogar.
7. **Lazy Loading del Módulo de Gráficos (`Recharts`):**
   - **Esfuerzo:** 3 horas.
   - **Acción:** Dividir el bundle de `ConsumptionHistory` para reducir el bundle inicial.

---

## 5. Declaración de Limitaciones de Verificación
- **Pruebas Físicas de Web Bluetooth:** No fue posible ejecutar una vinculación real con un módulo físico IoT debido a que el entorno de auditoría es automatizado/headless. Se verificaron todas las protecciones de código y accesibilidad del modal correspondiente.
- **Servicios Backend Remotos:** Las pruebas de integración se ejecutaron con los mocks oficializados del proyecto (`vitest` / `@testing-library/react`). La infraestructura de backend real (`:8080` a `:8084`) no estuvo levantada en tiempo de ejecución de esta auditoría estática y de suite de pruebas unitarias.
