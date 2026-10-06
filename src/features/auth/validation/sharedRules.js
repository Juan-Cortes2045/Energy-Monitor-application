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

// Nombre y apellido replican el límite del backend (`@Size(max = 100)` en
// RegisterRequest). El trim local evita mandar espacios que el backend no
// descarta: los guarda tal cual en `person.name`.
export const personNameRule = (t) =>
  z
    .string()
    .trim()
    .min(1, t("errors.required"))
    .min(2, t("errors.nameMin"))
    .max(100, t("errors.nameMax"));
