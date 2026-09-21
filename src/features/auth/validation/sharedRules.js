import { z } from "zod";

// Reglas reutilizables de auth: cada schema se compone a partir de estas.
export const emailRule = (t) =>
  z
    .string()
    .trim()
    .min(1, t("errors.required"))
    .email(t("errors.invalidEmail"));

// Base de contraseña (obligatoria + longitud). La complejidad es solo del registro.
export const passwordRule = (t) =>
  z.string().min(1, t("errors.required")).min(8, t("errors.passwordMin"));
