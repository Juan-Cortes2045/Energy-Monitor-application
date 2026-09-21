import { z } from "zod";

// Código de verificación: exactamente 6 dígitos numéricos.
export const codeSchema = (t) =>
  z.string().regex(/^\d{6}$/, t("errors.codeInvalid"));
