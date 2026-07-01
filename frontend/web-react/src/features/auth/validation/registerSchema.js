import { z } from "zod";

export const registerSchema = (t) =>
  z
    .object({
      name: z.string().min(1, t("errors.required")),

      email: z.string().min(1, t("errors.required")),

      password: z
        .string()
        .min(8, t("errors.passwordMin"))
        .regex(/[A-Z]/, t("errors.passwordUpper"))
        .regex(/(.*[a-z]){3,}/, t("errors.passwordLower"))
        .regex(/(.*[0-9]){3,}/, t("errors.passwordNumber"))
        .regex(/[^A-Za-z0-9]/, t("errors.passwordSpecial")),

      repeatPassword: z.string().min(1, t("errors.repeatPassword")),

      terms: z.boolean().refine((val) => val === true, {
        message: t("errors.terms"),
      }),
    })
    .refine((data) => data.password === data.repeatPassword, {
      message: t("errors.passwordMatch"),
      path: ["repeatPassword"],
    });
