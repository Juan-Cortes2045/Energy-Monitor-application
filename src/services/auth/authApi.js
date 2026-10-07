import { httpClient } from "../http/httpClient";
import { clearSession, getSession, getSessionId, saveSession } from "./session";

export async function login({ email, password }) {
  const { data } = await httpClient.post("/auth/login", { email, password });
  saveSession(data);
  await refreshProfile().catch(() => {}); // nombre y foto; el login ya es válido sin ellos
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
 * Edita nombre y apellido (siempre como par) y/o la foto de perfil. Solo se
 * envían los campos recibidos. `profileImage` es un data-URL; "" la elimina.
 * Guarda en la sesión lo que el backend confirmó o, para la foto, lo enviado.
 */
export async function updateProfile({ name, lastName, profileImage }) {
  const { data } = await httpClient.put("/auth/profile", { name, lastName, profileImage });
  saveSession({
    profile: {
      ...getSession()?.profile,
      name: data.name,
      lastName: data.lastName,
      ...(profileImage !== undefined ? { profileImage: profileImage || null } : {}),
    },
  });
  return data;
}

/**
 * GET /auth/account: refresca correo, foto, nombre y apellido. Se llama al
 * abrir el perfil.
 */
export async function getAccount() {
  const { data } = await httpClient.get("/auth/account");
  const prev = getSession();
  saveSession({
    account: { ...prev?.account, idUser: data.idUser ?? prev?.account?.idUser, email: data.email },
    profile: {
      ...prev?.profile,
      ...(data.name != null ? { name: data.name, lastName: data.lastName ?? "" } : {}),
      profileImage: data.profileImage ?? null,
    },
  });
  return data;
}

/** Deja en la sesión correo, foto, nombre y apellido del usuario. */
export async function refreshProfile() {
  await getAccount();
}

/** Elimina la cuenta tras confirmar con la contraseña; cierra la sesión local. */
export async function deleteAccount(password) {
  await httpClient.post("/auth/account/delete", { password });
  clearSession();
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
