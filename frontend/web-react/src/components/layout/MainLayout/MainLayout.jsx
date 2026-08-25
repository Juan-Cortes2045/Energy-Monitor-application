import { Outlet } from "react-router-dom";
import  Sidebar  from "./Sidebar/Sidebar";
import styles from "../MainLayout/MainLayout.module.css"

const  MainLayout= () =>{
    return(
        <div
            className={styles.container}
            style={{
                "--main-bg": "var(--color-background)",
                "--main-padding": "var(--spacing-lg)",
            }}
        >
            <Sidebar />

            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    )
}

export default MainLayout;
