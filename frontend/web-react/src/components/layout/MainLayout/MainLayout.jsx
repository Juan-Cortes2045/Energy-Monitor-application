import { Outlet } from "react-router-dom";
import  Sidebar  from "./Sidebar/Sidebar";
import styles from "../MainLayout/MainLayout.module.css"

import colors from "../../../design/tokens/colors";
import spacing from "../../../design/tokens/spacing";

const  MainLayout= () =>{
    return(
        <div
            className={styles.container}
            style={{
                "--main-bg": colors.background,
                "--main-padding": spacing.lg,
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