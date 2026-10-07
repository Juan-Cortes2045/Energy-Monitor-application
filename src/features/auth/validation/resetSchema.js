import { z } from "zod";

// Política real del backend (password_policy sembrada): 8–64, mayúscula, número y símbolo.
export const newPasswordSchema = (t) =>
  z
    .object({
      newPassword: z
        .string()
        .min(8, t("errors.passwordMin"))
        .max(64, t("errors.passwordMax"))
        .regex(/[A-Z]/, t("errors.passwordUpper"))
        .regex(/[0-9]/, t("errors.passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("errors.passwordSpecial")),
      repeatPassword: z.string().min(1, t("errors.repeatPassword")),
    })
    .refine((d) => d.newPassword === d.repeatPassword, {
      message: t("errors.passwordMatch"),
      path: ["repeatPassword"],
    });
