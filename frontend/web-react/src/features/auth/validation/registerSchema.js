import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(1, "El campo es obligatorio."),

    email: z.string().min(1, "El campo es obligatorio."),

    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe tener una mayúscula")
      .regex(/(.*[a-z]){3,}/, "Debe tener al menos 3 minúsculas")
      .regex(/(.*[0-9]){3,}/, "Debe tener al menos 3 números")
      .regex(/[^A-Za-z0-9]/, "Debe tener un carácter especial"),

    repeatPassword: z.string().min(1, "Confirma tu contraseña"),

    terms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })

  .refine((data) => data.password === data.repeatPassword, {
    message: "Las contraseñas no coinciden",
    path: ["repeatPassword"],
  });
