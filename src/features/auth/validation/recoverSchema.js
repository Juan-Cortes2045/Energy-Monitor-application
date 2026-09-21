import { z } from "zod";
import { emailRule } from "./sharedRules";

export const recoverSchema = (t) => z.object({ email: emailRule(t) });
