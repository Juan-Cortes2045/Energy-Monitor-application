import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import styles from "../Sidebar/Sidebar.module.css";
import logoClaro from "../../../../assets/Logo_proyecto_Vclara.png"
import NavProjects from "./NavProjects";

import {
    Menu,
    Home,
    CloudLightning,
    Heart,
    Bell,
    Settings,
    MoreHorizontal,
    Plus,
    User,
} from "lucide-react"

import NavItem from "./NavItem";
import Button from "../../../../design/components/Button/Button"

import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";

const Sidebar =() => {
    const[collapsed, setCollapsed]= useState(false);
    const[openMenu, setOpenMenu]= useState(false);

    const navigate= useNavigate();
    const dropdownRef= useRef(null);
    useEffect(()=>{
                const handleClickOutside =(event)=>{
                    if(
                        dropdownRef.current &&
                        !dropdownRef.current.contains(event.target)
                    ){
                        setOpenMenu(false);
                    }
                }
                document.addEventListener("mousedown", handleClickOutside);
                return () =>{
                    document.removeEventListener("mousedown", handleClickOutside);
                }
        }, [])
    return(
        <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed: ""}`}
        style={{
            backgroundColor: colors.background_left,
            padding: spacing.md,
        }}
        >
        {/*HEADER*/}
        <div className={styles.top}>
            <button
            onClick={()=> setCollapsed(!collapsed)}
            className={styles.toggle}
            >
                <Menu size={24}/>
            </button>
            <img src={logoClaro} alt="EnergyMonitor" className={styles.logo}/>
        </div>
        
        {/*NAV*/}
        <nav className={styles.nav}>
            <NavItem to="/dashboard" icon={<Home size={24}/>} label="Inicio" collapsed={collapsed}/>
            <div className={styles.navGroup}>
            <NavProjects icon={<CloudLightning size={24}/>} label="Proyectos" collapsed={collapsed} />
            </div>
            <NavItem to="/favorites" icon={<Heart size={24}/>} label="Favoritos" collapsed={collapsed}/>
            <NavItem to="/notifications" icon={<Bell size={24}/>} label="Notificaciones" collapsed={collapsed}/>
            <NavItem to="/settings" icon={<Settings size={24}/>} label="Ajustes" collapsed={collapsed}/>
        </nav>
         

        <div className={styles.profile} ref={dropdownRef}>
            <div 
            className={styles.profileInfo}
            onClick={()=> navigate("/account")}
            style={{cursor: "pointer"}}
            >
                <img 
                src="https://i.pravatar.cc/40" 
                alt="user" 
                className={styles.avatar}
                />

                {!collapsed &&(
                    <span
                    style={{
                        fontFamily: typography.fontPrimary,
                        fontSize:typography.sizes.md,
                        color: colors.surface,
                    }}
                    >
                        User001
                    </span>
                )}

                <button
                onClick={(e)=> {
                    e.stopPropagation();
                    setOpenMenu(!openMenu);
                }}
                className={styles.menuBtn}
                >
                    <MoreHorizontal size={20}/>
                </button>
            </div>

            {/*DROPDOWN*/}
           
            {openMenu &&(
                <div className={styles.dropdown}>
                    <div className={styles.item} onClick={()=> navigate("/account")}>
                        <User size={24} /> Mi cuenta
                    </div>

                    <div className={styles.item}>
                        <Plus size={24} /> Añadir cuenta
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.item}>
                        <Button
                            type="submit"
                            variant="primary"
                            onClick={()=> navigate("/home")}
                            style={{ width: "100%" }}
                        >
                            Cerrar sesión
                        </Button>
                    </div>
                </div>
            )}
        </div>
        </aside>
    )
}

export default Sidebar;