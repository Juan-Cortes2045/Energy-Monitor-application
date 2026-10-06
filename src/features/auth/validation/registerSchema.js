import { z } from "zod";
import { emailRule, passwordRule, personNameRule } from "./sharedRules";

export const registerSchema = (t) =>
  z
    .object({
      name: personNameRule(t),

      lastName: personNameRule(t),

      email: emailRule(t),

      password: passwordRule(t)
        .max(64, t("errors.passwordMax"))
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
