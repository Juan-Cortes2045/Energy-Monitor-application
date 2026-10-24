import { z } from "zod";

// Reglas reutilizables de auth: cada schema se compone a partir de estas.
export const emailRule = (t) =>
  z
    .string()
    .trim()
    .min(1, t("errors.required"))
    .email(t("errors.invalidEmail"));

// Contraseña obligatoria, sin más reglas: es la del login, que no debe rechazar contraseñas
// antiguas que no cumplan la política actual.
export const passwordRule = (t) =>
  z.string().min(1, t("errors.required")).min(8, t("errors.passwordMin"));

// La política del backend (tabla password_policy), la misma al registrarse, al recuperar y al
// cambiar la contraseña: 8 a 64 caracteres, una mayúscula, un número y un símbolo. El backend
// usa Character.isUpperCase / isDigit / isLetterOrDigit de Java, por eso las clases Unicode:
// "Ñ" o "É" cuentan como mayúscula y cualquier carácter que no sea letra ni dígito, como símbolo.
export const strongPasswordRule = (t) =>
  passwordRule(t)
    .max(64, t("errors.passwordMax"))
    .regex(/\p{Lu}/u, t("errors.passwordUpper"))
    .regex(/\p{Nd}/u, t("errors.passwordNumberOne"))
    .regex(/[^\p{L}\p{Nd}]/u, t("errors.passwordSpecial"));

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
