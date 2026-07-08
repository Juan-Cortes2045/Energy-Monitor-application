import { useState, useRef, useEffect } from "react";
import { VscAccount } from "react-icons/vsc";
import { FiEdit3 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import styles from "./Account.module.css";

const Account = ({ onClose }) => {
  const { t } = useTranslation("account");
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
          <h2 className={styles.title}>{t("title")}</h2>

          {/* ── Avatar + dropdown ────────────────────────────────── */}
          <div className={styles.avatarWrapper} ref={wrapperRef}>
            <div
              className={styles.avatarContainer}
              onClick={() => setOpen((o) => !o)}
              aria-label={t("photoOptions")}
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
                  {t("addPhoto")}
                </li>

                <li
                  onClick={() => {
                    if (image) window.open(image);
                    setOpen(false);
                  }}
                >
                  {t("viewPhoto")}
                </li>

                <li
                  onClick={() => {
                    setImage(null);
                    setOpen(false);
                  }}
                  className={styles.dropdownDanger}
                >
                  {t("delete")}
                </li>
              </ul>
            )}
          </div>

          {/* ── Campos de información ─────────────────────────────── */}
          <div className={styles.form}>
            <div className={styles.row}>
              <label className={styles.label}>{t("name")}</label>
              <p className={styles.value}>Usuario001</p>
              <Button variant="primary" className={styles.btnEdit}>
                <FiEdit3 />
              </Button>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>{t("email")}</label>
              <p className={styles.value}>Usuario001@email.com</p>
              <Button variant="primary" className={styles.btnEdit}>
                <FiEdit3 />
              </Button>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>{t("phone")}</label>
              <p className={styles.value}>{t("noPhone")}</p>
              <Button variant="primary" className={styles.btnEdit}>
                <FiEdit3 />
              </Button>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>{t("password")}</label>
              <p className={styles.value}>••••••••</p>
              <Button variant="primary" className={styles.btnEdit}>
                <FiEdit3 />
              </Button>
            </div>
          </div>

          {/* ── Eliminar cuenta ───────────────────────────────────── */}
          <div className={styles.deleteSection}>
            <p className={styles.deleteQuestion}>{t("deleteQuestion")}</p>
            <Button
              variant="secondary"
              style={{ color: "var(--color-danger)" }}
            >
              {t("deleteAccount")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Account;
