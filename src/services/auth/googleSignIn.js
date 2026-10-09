/**
 * "Iniciar sesión con Google" con Google Identity Services, flujo de código en ventana emergente.
 *
 * El navegador solo obtiene un código de un solo uso; el backend lo canjea con el secreto del
 * cliente (que nunca llega al navegador) y verifica la identidad con Google. Por eso el botón
 * puede tener el diseño propio de la app.
 *
 * Se activa con VITE_GOOGLE_CLIENT_ID (el mismo ID de cliente que GOOGLE_CLIENT_ID del backend).
 */

const SCRIPT_URL = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

let scriptPromise = null;

export const isGoogleEnabled = () => CLIENT_ID.trim() !== "";

function loadScript() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new GoogleSignInError("unavailable"));
      };
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

/** Error del lado de Google: `reason` es "cancelled" o "unavailable". */
export class GoogleSignInError extends Error {
  constructor(reason) {
    super(`google sign-in ${reason}`);
    this.name = "GoogleSignInError";
    this.reason = reason;
  }
}

/**
 * Abre la ventana de Google y resuelve con el código de autorización.
 * Rechaza con GoogleSignInError si la persona la cierra o Google no responde.
 * @returns {Promise<string>}
 */
export async function requestGoogleCode() {
  if (!isGoogleEnabled()) throw new GoogleSignInError("unavailable");
  await loadScript();
  return new Promise((resolve, reject) => {
    const client = globalThis.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID.trim(),
      scope: "openid email profile",
      ux_mode: "popup",
      select_account: true,
      callback: (response) => {
        if (response?.code) resolve(response.code);
        else reject(new GoogleSignInError(response?.error === "access_denied" ? "cancelled" : "unavailable"));
      },
      error_callback: (error) =>
        reject(
          new GoogleSignInError(
            error?.type === "popup_closed" || error?.type === "popup_failed_to_open"
              ? "cancelled"
              : "unavailable",
          ),
        ),
    });
    client.requestCode();
  });
}
