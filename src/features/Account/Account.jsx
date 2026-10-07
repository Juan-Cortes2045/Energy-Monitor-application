import { useState, useRef, useEffect } from "react";
import { VscAccount } from "react-icons/vsc";
import { FiEdit3 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import { getSession } from "../../services/auth/session";
import { updateProfile } from "../../services/auth/authApi";
import ChangePasswordModal from "./ChangePasswordModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import styles from "./Account.module.css";

const Account = ({ onClose }) => {
  const { t } = useTranslation("account");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  // GET /auth/account no trae nombre/apellido: se muestran los guardados en la sesión.
  const saved = {
    name: getSession()?.profile?.name ?? "",
    lastName: getSession()?.profile?.lastName ?? "",
    email: getSession()?.account?.email ?? "",
  };
  const [values, setValues] = useState(saved);
  const [draft, setDraft] = useState(saved);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modal, setModal] = useState(null); // null | "password" | "delete"

  const startEdit = () => {
    setDraft(values);
    setMessage({ type: "", text: "" });
    setEditing(true);
  };

  const handleSave = async () => {
    const name = draft.name.trim();
    const lastName = draft.lastName.trim();
    if (!name || !lastName) {
      return setMessage({ type: "error", text: t("nameRequired") });
    }
    setSaving(true);
    try {
      await updateProfile({ name, lastName });
      setValues((v) => ({ ...v, name, lastName }));
      setEditing(false);
      setMessage({ type: "ok", text: t("saved") });
    } catch {
      setMessage({ type: "error", text: t("profileError") });
    } finally {
      setSaving(false);
    }
  };

  // El correo no se edita: es la identidad de la cuenta (login y registro).
  const fields = [
    ["name", "name"],
    ["lastName", "lastName"],
  ];

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

  // Bloquea el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className={styles.page} onClick={handleOverlayClick}>
      <div className={styles.modalWrapper}>
        <Card>
          {/* ── Botón cerrar ─────────────────────────────────────── */}
          <div className={styles.closeBtnRow}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t("close")}
            >
              x
            </button>
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
              {fields.map(([key, label]) => (
                <div className={styles.row} key={key}>
                  <label className={styles.label} htmlFor={`field-${key}`}>
                    {t(label)}
                  </label>
                  {editing ? (
                    <input
                      id={`field-${key}`}
                      type="text"
                      className={styles.input}
                      value={draft[key]}
                      maxLength={100}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    />
                  ) : (
                    <p className={styles.value}>{values[key] || "—"}</p>
                  )}
                  <Button
                    variant="primary"
                    className={styles.btnEdit}
                    onClick={startEdit}
                    disabled={editing}
                  >
                    <FiEdit3 aria-label={t("edit")} />
                  </Button>
                </div>
              ))}

              <div className={styles.row}>
                <label className={styles.label}>{t("email")}</label>
                <p className={styles.value}>{values.email || "—"}</p>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>{t("password")}</label>
                <p className={styles.value}>••••••••</p>
                <Button
                  variant="primary"
                  className={styles.btnEdit}
                  onClick={() => setModal("password")}
                >
                  <FiEdit3 />
                </Button>
              </div>
            </div>

            {editing && (
              <div className={styles.editActions}>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  {t("cancel")}
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {t("save")}
                </Button>
              </div>
            )}
            {message.text && (
              <p
                role="status"
                className={message.type === "error" ? styles.msgError : styles.msgOk}
              >
                {message.text}
              </p>
            )}

            {/* ── Eliminar cuenta ───────────────────────────────────── */}
            <div className={styles.deleteSection}>
              <p className={styles.deleteQuestion}>{t("deleteQuestion")}</p>
              <Button
                variant="secondary"
                className={styles.btnDelete}
                style={{ color: "var(--color-danger)" }}
                onClick={() => setModal("delete")}
              >
                {t("deleteAccount")}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {modal === "password" && (
        <ChangePasswordModal
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            setMessage({ type: "ok", text: t("changePassword.success") });
          }}
        />
      )}
      {modal === "delete" && (
        <ConfirmDeleteModal
          onClose={() => setModal(null)}
          // TODO: el backend aún no expone eliminación de cuenta; conectar aquí cuando exista.
          onConfirm={() => {
            setModal(null);
            setMessage({ type: "error", text: t("deleteModal.unavailable") });
          }}
        />
      )}
    </div>
  );
};

export default Account;
