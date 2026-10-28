import { useState, useRef, useEffect } from "react";
import { CircleUserRound, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import { useCurrentPerson } from "../../services/auth/useCurrentPerson";
import {
  deleteAccount,
  refreshProfile,
  requestAccountDeletionCode,
  updateProfile,
} from "../../services/auth/authApi";
import { errorMessage } from "../../services/http/errorMessages";
import { landingPath } from "../../services/auth/session";
import { useDialogA11y } from "../../hooks/useDialogA11y";
import PhotoViewer from "../../components/shared/PhotoViewer/PhotoViewer";
import { safeImage } from "../../components/shared/PhotoViewer/safeImage";
import { resizeImage } from "./resizeImage";
import ChangePasswordModal from "./ChangePasswordModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import styles from "./Account.module.css";

// Solo se muestran imágenes rasterizadas: un data-URL de otro tipo (HTML, SVG con scripts)
// abierto en una pestaña se ejecutaría con el origen de la aplicación.

const Account = ({ onClose }) => {
  const { t } = useTranslation("account");
  const { t: tc } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  // En la ruta /account no hay quien cierre el modal: vuelve a la página de inicio.
  const close = onClose ?? (() => navigate(landingPath()));
  const [deleteError, setDeleteError] = useState("");
  const fileInputRef = useRef(null);

  // Datos del usuario en sesión (reactivos): se refrescan al abrir con el backend.
  const person = useCurrentPerson();
  const values = {
    name: person?.name ?? "",
    lastName: person?.lastName ?? "",
    email: person?.email ?? "",
  };
  const image = safeImage(person?.profileImage);
  const [draft, setDraft] = useState(values);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modal, setModal] = useState(null); // null | "password" | "delete"
  const dialogRef = useDialogA11y(close);

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

  const toggleMenu = () => !savingPhoto && setOpen((o) => !o);

  // confirmation: { password } o, en una cuenta creada con Google, { code }.
  const handleDeleteAccount = async (confirmation) => {
    setDeleteError("");
    try {
      await deleteAccount(confirmation);
      navigate("/login", { replace: true, state: { notice: "accountDeleted" } });
    } catch (e) {
      // 400: código incorrecto; 401: contraseña incorrecta; 409: único propietario de un hogar
      // con miembros.
      setDeleteError(errorMessage(t, e, "accountDelete"));
    }
  };

  /** @returns {Promise<boolean>} si el código se envió (503: aún no se puede enviar) */
  const handleRequestDeletionCode = async () => {
    setDeleteError("");
    try {
      await requestAccountDeletionCode();
      return true;
    } catch (e) {
      setDeleteError(errorMessage(t, e, "accountDeleteCode"));
      return false;
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
    if (e.target === e.currentTarget) close();
  };

  return (
    <div className={styles.page} onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        className={styles.modalWrapper}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        tabIndex={-1}
      >
        <Card>
          {/* ── Botón cerrar ─────────────────────────────────────── */}
          <div className={styles.closeBtnRow}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={close}
              aria-label={tc("close")}
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.inner}>
            {/* ── Título ───────────────────────────────────────────── */}
            <h2 id="account-title" className={styles.title}>
              {t("title")}
            </h2>

            {/* ── Avatar + dropdown ────────────────────────────────── */}
            <div
              className={styles.avatarWrapper}
              ref={wrapperRef}
              // Escape cierra solo el menú de la foto, no el modal de la cuenta.
              onKeyDown={(e) => {
                if (e.key === "Escape" && open) {
                  e.stopPropagation();
                  setOpen(false);
                }
              }}
            >
              <button
                type="button"
                className={styles.avatarContainer}
                // Mientras se guarda la foto el menú queda bloqueado para no repetir la petición.
                onClick={toggleMenu}
                aria-label={t("photoOptions")}
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls="account-photo-menu"
                aria-disabled={savingPhoto}
                aria-busy={savingPhoto}
              >
                {image ? (
                  <img
                    src={image}
                    className={styles.avatarImg}
                    alt={t("avatarAlt")}
                    width={100}
                    height={100}
                  />
                ) : (
                  <CircleUserRound className={styles.icon} strokeWidth={1.5} />
                )}
              </button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                ref={fileInputRef}
                onChange={handleImageChange}
                hidden
              />

              {open && (
                <ul id="account-photo-menu" className={styles.dropdown}>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        fileInputRef.current.click();
                        setOpen(false);
                      }}
                    >
                      {t("addPhoto")}
                    </button>
                  </li>

                  {/* Ver y eliminar solo tienen sentido si hay foto. */}
                  {image && (
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setViewing(true);
                          setOpen(false);
                        }}
                      >
                        {t("viewPhoto")}
                      </button>
                    </li>
                  )}

                  {image && (
                    <li>
                      <button
                        type="button"
                        className={styles.dropdownDanger}
                        onClick={() => {
                          savePhoto("");
                          setOpen(false);
                        }}
                      >
                        {t("delete")}
                      </button>
                    </li>
                  )}
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
                      autoComplete={key === "name" ? "given-name" : "family-name"}
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
                    aria-label={t("editField", { field: t(label) })}
                  >
                    <Pencil size={18} />
                  </Button>
                </div>
              ))}

              {/* Solo lectura: no son campos de formulario, así que no llevan <label>. */}
              <div className={styles.row}>
                <span className={styles.label}>{t("email")}</span>
                <p className={styles.value}>{values.email || "—"}</p>
              </div>

              <div className={styles.row}>
                <span className={styles.label}>{t("password")}</span>
                {person?.googleAccount ? (
                  // Creada con Google: no hay contraseña que la persona conozca ni pueda cambiar.
                  <p className={styles.value}>{t("passwordGoogle")}</p>
                ) : (
                  <>
                    <p className={styles.value} aria-hidden="true">
                      ••••••••
                    </p>
                    <Button
                      variant="primary"
                      className={styles.btnEdit}
                      onClick={() => setModal("password")}
                      aria-label={t("changePassword.title")}
                    >
                      <Pencil size={18} />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {editing && (
              <div className={styles.editActions}>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  {t("cancel")}
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={saving} aria-busy={saving}>
                  {t("save")}
                </Button>
              </div>
            )}
            {message.text && (
              <p
                role={message.type === "error" ? "alert" : "status"}
                className={message.type === "error" ? styles.msgError : styles.msgOk}
              >
                {message.text}
              </p>
            )}

            {/* ── Eliminar cuenta ───────────────────────────────────── */}
            <div className={styles.deleteSection}>
              <p className={styles.deleteQuestion}>{t("deleteQuestion")}</p>
              <Button
                variant="Danger"
                className={styles.btnDelete}
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
          googleAccount={person?.googleAccount === true}
          email={values.email}
          onRequestCode={handleRequestDeletionCode}
          error={deleteError}
          onClose={() => {
            setModal(null);
            setDeleteError("");
          }}
          onConfirm={handleDeleteAccount}
        />
      )}
      {viewing && image && (
        <PhotoViewer
          src={image}
          alt={t("avatarAlt")}
          closeLabel={t("closePhoto")}
          onClose={() => setViewing(false)}
        />
      )}
    </div>
  );
};

export default Account;
