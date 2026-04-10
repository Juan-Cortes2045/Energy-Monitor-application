import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../validation/loginSchema";

import googleIcon from "../../../assets/google_icon.png"
import Button from "../../../design/components/Button/Button.jsx";
import Input from "../../../design/components/Input/Input.jsx";
import Card from "../../../design/components/Card/Card.jsx";
import { Eye, EyeOff} from "lucide-react"
import { useState } from "react";
const LoginForm= () => {
    const [showPassword, setShowPassword]= useState(false);
    const {
        register,
        handleSubmit,
        formState:{ errors },
    } = useForm({
        resolver:
        zodResolver(loginSchema),
    });

    const onSubmit= (data)=> {
        console.log("login:", data);
    };

    return(
        <Card>
            <h2>Iniciar sesión</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/*EMAIL*/}
                <div>
                    <label htmlFor="email">Correo electrónico</label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                        <p>{errors.email.message}</p>
                    )}
                </div>

                {/*PASSWORD*/}
                <div>
                    <label htmlFor="password">Contraseña</label>
                    <div style={{position: 'relative', width:'50%'}}>
                        <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} style={{paddingRight:'45px', width: '100%'}} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} 
                        style={{
                            position: 'absolute', 
                            right: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            }}
                        >
                            {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </button>
                    </div> 
                    {errors.password && (
                            <p>{errors.password.message}</p>
                    )}         
                </div>
                
                {/*RECUPERAR CONTRASEÑA*/}
                <p>
                    <a href="/recover-password">
                    ¿Olvidaste tu contraseña?
                    </a>
                </p>

                {/*BOTON LOGIN*/}
                <Button type="submit">
                    Ingresar
                </Button>

                {/*GOOGLE LOGIN*/}
                <p>___________O____________</p>
                <Button type="button" variant="secondary">
                    <img src={googleIcon} alt="Google"/>
                    Google
                </Button>

                
            </form>
        </Card>
    );
};

export default LoginForm;