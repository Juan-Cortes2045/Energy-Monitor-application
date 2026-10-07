import { useState, useRef, useEffect } from "react";
import { VscAccount } from "react-icons/vsc";
import { FiEdit3 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import { useCurrentPerson } from "../../services/auth/useCurrentPerson";
import { deleteAccount, refreshProfile, updateProfile } from "../../services/auth/authApi";
import { errorMessage } from "../../services/http/errorMessages";
import { resizeImage } from "./resizeImage";
import ChangePasswordModal from "./ChangePasswordModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import styles from "./Account.module.css";

const Account = ({ onClose }) => {
  const { t } = useTranslation("account");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState("");
  const fileInputRef = useRef(null);

  // Datos del usuario en sesión (reactivos): se refrescan al abrir con el backend.
  const person = useCurrentPerson();
  const values = {
    name: person?.name ?? "",
    lastName: person?.lastName ?? "",
    email: person?.email ?? "",
  };
  const image = person?.profileImage ?? null;
  const [draft, setDraft] = useState(values);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
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

  useEffect(() => {
    refreshProfile().catch(() => {}); // sin conexión: se queda con lo guardado en la sesión
  }, []);

  const savePhoto = async (profileImage) => {
    setMessage({ type: "", text: "" });
    setSavingPhoto(true);
    try {
      await updateProfile({ profileImage });
      setMessage({ type: "ok", text: t("photoSaved") });
    } catch {
      setMessage({ type: "error", text: t("photoError") });
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;
    try {
      await savePhoto(await resizeImage(file));
    } catch {
      setMessage({ type: "error", text: t("photoError") });
    }
  };

  const viewPhoto = async () => {
    if (!image) return;
    const blob = await (await fetch(image)).blob(); // los data-URL no abren en pestaña nueva
    window.open(URL.createObjectURL(blob));
  };

  const handleDeleteAccount = async (password) => {
    setDeleteError("");
    try {
      await deleteAccount(password);
      navigate("/login", { replace: true, state: { notice: "accountDeleted" } });
    } catch (e) {
      // 401: contraseña incorrecta; 409: único propietario de un hogar con miembros.
      setDeleteError(errorMessage(t, e, "accountDelete"));
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
                // Mientras se guarda la foto el menú queda bloqueado para no repetir la petición.
                onClick={() => !savingPhoto && setOpen((o) => !o)}
                aria-label={t("photoOptions")}
                aria-disabled={savingPhoto}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && !savingPhoto && setOpen((o) => !o)}
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
                      viewPhoto();
                      setOpen(false);
                    }}
                  >
                    {t("viewPhoto")}
                  </li>

                  <li
                    onClick={() => {
                      if (image) savePhoto("");
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
          error={deleteError}
          onClose={() => {
            setModal(null);
            setDeleteError("");
          }}
          onConfirm={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default Account;
