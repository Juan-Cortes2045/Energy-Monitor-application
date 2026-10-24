import { describe, it, expect } from "vitest";
import { registerSchema } from "./registerSchema";
import { changePasswordSchema, newPasswordSchema } from "./resetSchema";

const t = (key) => key;
const register = (password) =>
  registerSchema(t).safeParse({
    name: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    password,
    repeatPassword: password,
    terms: true,
  }).success;
const reset = (password) =>
  newPasswordSchema(t).safeParse({ newPassword: password, repeatPassword: password }).success;
const change = (password) =>
  changePasswordSchema(t).safeParse({
    currentPassword: "Vieja#123",
    newPassword: password,
    repeatPassword: password,
  }).success;

// La misma política que el backend (password_policy): 8–64, mayúscula, número y símbolo.
describe("política de contraseñas", () => {
  it.each([register, reset, change])("las tres pantallas aplican la misma regla (%#)", (valid) => {
    expect(valid("CLAVE#1x")).toBe(true); // antes el registro pedía 3 minúsculas y 3 números
    expect(valid("Ñandú#24")).toBe(true); // mayúscula con tilde, como Character.isUpperCase
    expect(valid("Clave 12")).toBe(true); // un espacio cuenta como símbolo
    expect(valid("Clave#1")).toBe(false); // 7 caracteres
    expect(valid(`Clave#1${"x".repeat(58)}`)).toBe(false); // 65 caracteres
    expect(valid("clave#12")).toBe(false); // sin mayúscula
    expect(valid("Clave#ab")).toBe(false); // sin número
    expect(valid("Clave123")).toBe(false); // sin símbolo
  });
});
