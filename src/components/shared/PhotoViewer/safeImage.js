/** Solo se muestran imágenes incrustadas (data URL) de tipos de imagen conocidos. */
export const SAFE_IMAGE = /^data:image\/(jpeg|png|webp|gif);/i;

/** @returns {string|null} la imagen si es segura de mostrar; null si falta o no es una imagen */
export const safeImage = (src) => (typeof src === "string" && SAFE_IMAGE.test(src) ? src : null);
