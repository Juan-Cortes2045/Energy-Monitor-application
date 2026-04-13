import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./RegisterForm.module.css";
import { registerSchema } from "../../validation/registerSchema.js";

import googleIcon from "../../../../assets/google_icon.png";

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  const onSubmit = (data) => {
    console.log("register:", data);
    mode: "onChange";
  };

  return (
    <Card>
      <h2 className={styles.title}>Registro</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* NAME */}
        <Input id="name" type="text" placeholder="*" {...register("name")}>
          Nombre
        </Input>
        {errors.name && (
          <span className={styles.error}>{errors.name.message}</span>
        )}

        {/* EMAIL */}
        <Input id="email" type="email" placeholder="*" {...register("email")}>
          Correo electrónico
        </Input>
        {errors.email && (
          <span className={styles.error}>{errors.email.message}</span>
        )}

        {/* PASSWORD */}
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="*"
          icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onIconClick={() => setShowPassword(!showPassword)}
          {...register("password")}
        >
          Contraseña
        </Input>
        {errors.password && (
          <span className={styles.error}>{errors.password.message}</span>
        )}

        {/* REPEAT PASSWORD */}
        <Input
          id="repeatPassword"
          type={showRepeatPassword ? "text" : "password"}
          placeholder="*"
          icon={showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onIconClick={() => setShowRepeatPassword(!showRepeatPassword)}
          {...register("repeatPassword")}
        >
          Repetir contraseña
        </Input>
        {errors.repeatPassword && (
          <span className={styles.error}>{errors.repeatPassword.message}</span>
        )}

        {/* TERMS */}
        <div className={styles.options}>
          <label className={styles.terms}>
            <input type="checkbox" {...register("terms")} />
            <p>
              Estoy de acuerdo con los <span>Términos de uso</span> y la{" "}
              <span>Política de privacidad</span>
            </p>
          </label>
          {errors.terms && (
            <span className={styles.error}>{errors.terms.message}</span>
          )}
        </div>

        {/* BUTTONS */}
        <div className={styles.buttonsContainer}>
          <Button type="submit" variant="primary">
            Registrarse
          </Button>

          {/* DIVIDER */}
          <div className={styles.divider}>
            <span>__________________________O__________________________</span>
          </div>

          {/* GOOGLE */}
          <p>Registrarse usando:</p>
          <Button type="button" variant="google" icon={googleIcon}>
            Google
          </Button>
        </div>

        {/* LOGIN */}
        <p className={styles.register}>
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className={styles.registerLink}>
            Inicia sesión
          </a>
        </p>
      </form>
    </Card>
  );
};

export default RegisterForm;
