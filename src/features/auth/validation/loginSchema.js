import { z } from "zod";
import { emailRule, passwordRule } from "./sharedRules";

export const loginSchema = (t) =>
  z.object({
    email: emailRule(t),
    password: passwordRule(t),
  });
