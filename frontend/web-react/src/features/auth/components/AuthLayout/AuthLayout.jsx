import logoProyecto from "../../../../assets/logo_proyecto.png";
import colors from "../../../../design/tokens/colors.js"
import styles from "./AuthLayout.module.css";

const AuthLayout = ({children}) => {
    return (
        <div className={styles.container}>

            {/*LADO IZQUIERDO*/}
            <div className={styles.left} style={{backgroundColor: colors.background_left}}>
                <div className={styles.brand}>
                    <img src={logoProyecto} alt="EnergyMonitor"/>
                </div>
            </div>

            {/*LADO DERECHO*/}
            <div className={styles.right} style={{backgroundColor: colors.background}}>
                {children}
            </div>
        </div>
    )
}

export default AuthLayout;