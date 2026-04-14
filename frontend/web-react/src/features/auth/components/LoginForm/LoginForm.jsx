import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validation/loginSchema.js";
import styles from "../LoginForm/LoginForm.module.css"
import colors from "../../../../design/tokens/colors.js"

import googleIcon from "../../../../assets/google_icon.png"

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";

import { Eye, EyeOff} from "lucide-react"
import { useState } from "react";

const LoginForm= () => {
    const [showPassword, setShowPassword]= useState(false);

    const {
        register,
        handleSubmit,
        formState:{ errors },
    } = useForm({
        resolver:zodResolver(loginSchema),
    });

    const onSubmit= (data)=> {
        console.log("login:", data);
    };

    return(
        <Card>
            <h2 className={styles.title}>Iniciar sesión</h2>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {/*EMAIL*/}
                    <Input id="email" 
                    type="email" 
                    placeholder="*"
                    {...register("email")} >
                        Correo Electrónico
                    </Input>
                    {errors.email && (
                        <span className={styles.error} style={{
                            color: colors.danger
                        }}>{errors.email.message}</span>
                    )}

                {/*PASSWORD*/}
                        <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder= "*"
                        icon={
                            showPassword ?( 
                                <EyeOff size={20}/> 
                            ): (
                                <Eye size={20}/>
                            )
                        }

                        onIconClick={()=> setShowPassword(!showPassword)}
                        {...register("password")}
                        >
                        Contraseña
                        </Input>  
                    {errors.password && (
                            <span className={styles.error} style={{
                                color: colors.danger,
                            }}>{errors.password.message}</span>
                    )}    

                {/*OPCIONES*/} 
                <div className={styles.options}>
                    <label className={styles.renember}>
                        <input type="checkbox" />
                        Recordar datos
                    </label>
                
                    <a href="/recover-password" className={styles.link} style={{
                        color: colors.secondary,
                    }}>
                    ¿Olvidaste tu contraseña?
                    </a>
  
                </div>
                
                <div className={styles.buttonsContainer}>
                {/*BOTON LOGIN*/}
                <Button type="submit" variant="primary">
                    Ingresar
                </Button>

                {/*DIVIDER*/}
                <div className={styles.divider} style={{
                    color: colors.textSecondary,
                }}>
                    <span>__________________________O__________________________</span>
                </div>

                {/*GOOGLE LOGIN*/}
                <p className={styles.startUsing}>Iniciar usando:</p>
                <Button type="button" variant="google" icon={googleIcon}>
                    Google
                </Button>
                </div>

                {/*REGISTER*/}
                <p className={styles.register}>
                    ¿No tienes una cuenta?{" "}
                    <a href="/register" className={styles.link} style={{
                        color:colors.secondary,
                    }}>registrate</a>
                </p>
                
            </form>
        </Card>
    );
};

export default LoginForm;