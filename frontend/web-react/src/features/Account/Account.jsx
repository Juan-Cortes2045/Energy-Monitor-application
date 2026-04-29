import { useState, useRef, useEffect } from "react";
import { VscAccount } from "react-icons/vsc";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import styles from "./Account.module.css";

const Account = ({ onClose }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.btnClose} onClick={onClose}>
          x
        </div>
        <div className={styles.inner}>
          {/* ── Título ───────────────────────────────────────────── */}
          <h2 className={styles.title}>Mi cuenta</h2>

          {/* ── Avatar + dropdown ────────────────────────────────── */}
          <div className={styles.avatarWrapper} ref={wrapperRef}>
            <div
              className={styles.avatarContainer}
              onClick={() => setOpen((o) => !o)}
              aria-label="Opciones de foto"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
            >
              {image ? (
                <img src={image} className={styles.avatarImg} />
              ) : (
                <VscAccount className={styles.icon} />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              hidden
            />

            {open && (
              <ul className={styles.dropdown} role="menu">
                <li
                  onClick={() => {
                    fileInputRef.current.click();
                    setOpen(false);
                  }}
                >
                  Agregar foto
                </li>

                <li
                  onClick={() => {
                    if (image) window.open(image);
                    setOpen(false);
                  }}
                >
                  Ver foto
                </li>

                <li
                  onClick={() => {
                    setImage(null);
                    setOpen(false);
                  }}
                  className={styles.dropdownDanger}
                >
                  Eliminar
                </li>
              </ul>
            )}
          </div>

          {/* ── Campos de información ─────────────────────────────── */}
          <div className={styles.form}>
            <div className={styles.row}>
              <label className={styles.label}>Nombre</label>
              <p className={styles.value}>Usuario001</p>
              <Button variant="primary" size="small">
                Editar
              </Button>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>Correo</label>
              <p className={styles.value}>Usuario001@email.com</p>
              <Button variant="primary" size="small">
                Cambiar
              </Button>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>Teléfono</label>
              <p className={styles.value}>No tienes en el momento</p>
              <Button variant="primary" size="small">
                Vincular
              </Button>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>Contraseña</label>
              <p className={styles.value}>••••••••</p>
              <Button variant="primary" size="small">
                Actualizar
              </Button>
            </div>
          </div>

          {/* ── Eliminar cuenta ───────────────────────────────────── */}
          <div className={styles.deleteSection}>
            <p className={styles.deleteQuestion}>¿Deseas eliminar tu cuenta?</p>
            <Button
              variant="secondary"
              size="medium"
              style={{ color: "var(--color-danger)" }}
            >
              Eliminar cuenta
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Account;
