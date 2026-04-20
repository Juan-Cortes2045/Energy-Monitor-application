import { useEffect, useRef, useState } from "react";
import perfil from "../../../../assets/perfil.png";
import styles from "./ImportImg.module.css";

const ImportImg = () => {
  const [open, setOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(perfil);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <img
        className={styles.img}
        src={profileImage}
        alt="perfil"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
      />

      {open && (
        <div
          className={styles.dropdown}
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
        >
          <p>Tomar foto</p>
          <p>Ver foto</p>
          <p>Subir foto</p>
          <p>Eliminar</p>
        </div>
      )}
    </div>
  );
};

export default ImportImg;
