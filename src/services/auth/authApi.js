import { httpClient } from "../http/httpClient";
import { clearSession, getSession, getSessionId, saveSession } from "./session";

export async function login({ email, password }) {
  const { data } = await httpClient.post("/auth/login", { email, password });
  saveSession(data);
  return data.account;
}

export const register = (payload) =>
  httpClient.post("/auth/register", payload).then((r) => r.data);

export const verifyEmail = ({ email, code }) =>
  httpClient.post("/auth/email/verify", { email, code });

export const resendVerification = (email) =>
  httpClient.post("/auth/email/verification/resend", { email });

export const forgotPassword = (email) =>
  httpClient.post("/auth/password/forgot", { email });

export const resetPassword = ({ email, resetToken, newPassword }) =>
  httpClient.post("/auth/password/reset", { email, resetToken, newPassword });

export const changePassword = ({ currentPassword, newPassword }) =>
  httpClient.post("/auth/password/change", { currentPassword, newPassword });

/**
 * Edita nombre y apellido (siempre como par). Guarda en la sesión lo
 * que el backend confirmó, porque GET /auth/account no devuelve el nombre.
 */
export async function updateProfile({ name, lastName }) {
  const { data } = await httpClient.put("/auth/profile", { name, lastName });
  saveSession({ profile: { name: data.name, lastName: data.lastName } });
  return data;
}

/**
 * Cierra la sesión local primero (nada en vuelo puede revivirla) y avisa al
 * backend después, con el access token capturado antes de borrarlo.
 * El resultado del backend no importa: la sesión local ya no existe.
 */
export async function logout() {
  const accessToken = getSession()?.accessToken;
  const idUserSession = getSessionId();
  clearSession();
  if (!accessToken || !idUserSession) return;
  try {
    await httpClient.post(
      "/auth/logout",
      { idUserSession },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch {
    // ponytail: sin reintento; el backend expira la sesión por su cuenta
  }
}
