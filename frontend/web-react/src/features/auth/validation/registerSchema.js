import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),

    email: z.string().email("Correo inválido"),

    password: z.string().min(6, "Mínimo 6 caracteres"),

    repeatPassword: z.string().min(6, "Debes confirmar la contraseña"),

    terms: z.literal(true, {
      errorMap: () => ({
        message: "Debes aceptar los términos",
      }),
    }),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  });
