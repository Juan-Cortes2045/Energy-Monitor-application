import { z } from "zod";

// Política real del backend (password_policy sembrada): 8–64, mayúscula, número y símbolo.
const passwordRule = (t) =>
  z
    .string()
    .min(8, t("errors.passwordMin"))
    .max(64, t("errors.passwordMax"))
    .regex(/[A-Z]/, t("errors.passwordUpper"))
    .regex(/[0-9]/, t("errors.passwordNumber"))
    .regex(/[^A-Za-z0-9]/, t("errors.passwordSpecial"));

const matches = (t) => ({
  message: t("errors.passwordMatch"),
  path: ["repeatPassword"],
});

export const newPasswordSchema = (t) =>
  z
    .object({
      newPassword: passwordRule(t),
      repeatPassword: z.string().min(1, t("errors.repeatPassword")),
    })
    .refine((d) => d.newPassword === d.repeatPassword, matches(t));

export const changePasswordSchema = (t) =>
  z
    .object({
      currentPassword: z.string().min(1, t("errors.required")),
      newPassword: passwordRule(t),
      repeatPassword: z.string().min(1, t("errors.repeatPassword")),
    })
    .refine((d) => d.newPassword === d.repeatPassword, matches(t));
