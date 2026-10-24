import { z } from "zod";
import { strongPasswordRule } from "./sharedRules";

const matches = (t) => ({
  message: t("errors.passwordMatch"),
  path: ["repeatPassword"],
});

export const newPasswordSchema = (t) =>
  z
    .object({
      newPassword: strongPasswordRule(t),
      repeatPassword: z.string().min(1, t("errors.repeatPassword")),
    })
    .refine((d) => d.newPassword === d.repeatPassword, matches(t));

export const changePasswordSchema = (t) =>
  z
    .object({
      currentPassword: z.string().min(1, t("errors.required")),
      newPassword: strongPasswordRule(t),
      repeatPassword: z.string().min(1, t("errors.repeatPassword")),
    })
    .refine((d) => d.newPassword === d.repeatPassword, matches(t));
