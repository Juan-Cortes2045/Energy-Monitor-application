/**
 * Convierte un data-URL en base64 (la foto de perfil) en un Blob, sin `fetch`: la CSP de la
 * web solo permite conectar a la propia API y a Google (`connect-src`), así que `fetch(dataUrl)`
 * queda bloqueado.
 *
 * @param {string} dataUrl p. ej. "data:image/jpeg;base64,/9j/..."
 * @returns {Blob} con el tipo declarado en el data-URL
 * @throws {Error} si no es un data-URL en base64
 */
export function dataUrlToBlob(dataUrl) {
  const match = /^data:([^;,]+);base64,(.*)$/s.exec(dataUrl ?? "");
  if (!match) throw new Error("not a base64 data URL");
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: match[1] });
}
