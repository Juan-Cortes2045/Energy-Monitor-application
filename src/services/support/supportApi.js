import { httpClient } from "../http/httpClient";

/**
 * Administradores a los que la página de soporte puede escribir: `[{ name, email }]`, ordenados
 * por nombre. Público (se consulta sin sesión); lista vacía mientras no haya administradores.
 */
export const getSupportContacts = () =>
  httpClient.get("/support/contacts").then((r) => r.data ?? []);
