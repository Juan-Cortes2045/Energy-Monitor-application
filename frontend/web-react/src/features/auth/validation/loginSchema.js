import { z } from "zod"

export const loginSchema= z.object({
    email: z.string().email("Correo invalido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
});