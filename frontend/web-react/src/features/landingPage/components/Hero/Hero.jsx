import styles from "../Hero/Hero.module.css"

import { useNavigate } from "react-router-dom"
import Button from "../../../../design/components/Button/Button"
import heroImg from "../../../../assets/hero_img.jpeg"

import colors from "../../../../design/tokens/colors"
import spacing from "../../../../design/tokens/spacing"
import typography from "../../../../design/tokens/typography"
import radius from "../../../../design/tokens/radius"
import shadows from "../../../../design/tokens/shadows"

const Hero= ()=>{
    const navigate= useNavigate();
    return(
        <div className={styles.heroWrapper}>
        <section
        className={styles.container}>
        
        {/*IZQUIERDA*/}
        <div className={`${styles.left} ${styles.fadeUp}`}>
            <h1
            style={{
                fontWeight: typography.weights.bold,
                fontFamily: typography.fontPrimary,
                color: colors.textPrimary,
                lineHeight: "1.2",
            }}
            >
                Controla tu{" "}
                <span style={{color: colors.secondary}}>
                    consumo eléctrico
                </span>{" "}
                <span style={{color:colors.primary}}>
                    en tiempo real
                </span>
            </h1>

            <p
            style={{
                marginTop: spacing.md,
                color: colors.textSecondary,
                fontSize: typography.sizes.lg,
                fontWeight: typography.weights.bold,
                maxWidth: "450px"
            }}
            >
                Reduce costos, evita desperdicios y toma decisiones inteligentes desde tu hogar.
            </p>

            {/*BOTON*/}
            <div  className={styles.buttonWrapper} style={{marginTop: spacing.md}}>
                <Button  
                variant="primary" 
                onClick={()=> navigate("/login")}
                >
                    Comenzar ahora
                </Button>
            </div>

            {/*FUNCIONALIDADES*/}
            <div 
            className={styles.features}
            style={{
                marginTop: spacing.md,
                color: colors.textSecondary,
                fontSize: typography.sizes.md,
                fontWeight: typography.weights.medium
            }}
            >
                <span>Sin costos iniciales ✔️</span>
                <span>Fácil de usar ⚡</span>
                <span>Datos en tiempo real 📊</span>
            </div>
        </div>

        {/*DERECHA*/}
        <div className={`${styles.right} ${styles.fadeUpDelay}`}>
            <img 
            src={heroImg} 
            alt="Energy System" 
            style={{
                borderRadius:radius.md,
                boxShadow: shadows.lg,
            }}
            />
        </div>
        </section>
        </div>
    )
}

export default Hero;