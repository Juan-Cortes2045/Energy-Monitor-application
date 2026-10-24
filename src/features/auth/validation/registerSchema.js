import { z } from "zod";
import { emailRule, personNameRule, strongPasswordRule } from "./sharedRules";

export const registerSchema = (t) =>
  z
    .object({
      name: personNameRule(t),

      lastName: personNameRule(t),

      email: emailRule(t),

      password: strongPasswordRule(t),

      repeatPassword: z.string().min(1, t("errors.repeatPassword")),

      terms: z.boolean().refine((val) => val === true, {
        message: t("errors.terms"),
      }),
    })
    .refine((data) => data.password === data.repeatPassword, {
      message: t("errors.passwordMatch"),
      path: ["repeatPassword"],
    });
