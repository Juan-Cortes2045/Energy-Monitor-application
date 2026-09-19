import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VscAccount } from "react-icons/vsc";
import { FiEdit3 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import Input from "../../design/components/Input/Input";
import styles from "./Account.module.css";
import { getMe, updateMe } from "../../services/user.service";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../components/shared/ErrorState/ErrorState";

// Resizes/compresses the picked file client-side before it's sent as a JSON
// string (mock/server.js's PUT /api/users/me stores profile_image verbatim
// in mock/db.json, which lowdb rewrites in full on every write — an
// unresized camera photo would bloat that file for no visual benefit at
// avatar size).
function resizeImageToDataUrl(file, maxDim = 256, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("invalid image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const Account = ({ onClose }) => {
  const { t } = useTranslation("account");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const handleClose = onClose ?? (() => navigate(-1));
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [editingField, setEditingField] = useState(null); // null | "name" | "phone"
  const [draft, setDraft] = useState({});
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadMe = () => {
    setLoading(true);
    setLoadError(null);
    getMe()
      .then(setPerson)
      .catch(setLoadError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      await handleSave({ profile_image: dataUrl });
    } catch {
      setSaveError(t("saveError"));
    }
  };

  const handleDeletePhoto = () => handleSave({ profile_image: null });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const startEdit = (field) => {
    setSaveError(null);
    if (field === "name") {
      setDraft({ name: person.name, last_name: person.last_name });
    } else if (field === "phone") {
      setDraft({ cellphone: person.cellphone ?? "" });
    }
    setEditingField(field);
  };

  const handleSave = async (payload = draft) => {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateMe(payload);
      setPerson(updated);
      setEditingField(null);
      await refreshUser();
    } catch (err) {
      setSaveError(err.message || t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page} onClick={handleOverlayClick}>
        <div className={styles.modalWrapper}>
          <Card>
            <LoadingState />
          </Card>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page} onClick={handleOverlayClick}>
        <div className={styles.modalWrapper}>
          <Card>
            <ErrorState error={loadError} onRetry={loadMe} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} onClick={handleOverlayClick}>
      <div className={styles.modalWrapper}>
        <Card>
          <div className={styles.closeBtnRow}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label={t("close")}
            >
              x
            </button>
          </div>

          <div className={styles.inner}>
            <h2 className={styles.title}>{t("title")}</h2>

            <div className={styles.avatarWrapper} ref={wrapperRef}>
              <div
                className={styles.avatarContainer}
                onClick={() => setOpen((o) => !o)}
                aria-label={t("photoOptions")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setOpen((o) => !o)}
              >
                {person.profile_image ? (
                  <img src={person.profile_image} className={styles.avatarImg} />
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

                  {person.profile_image && (
                    <li
                      onClick={() => {
                        window.open(person.profile_image);
                        setOpen(false);
                      }}
                    >
                      {t("viewPhoto")}
                    </li>
                  )}

                  {person.profile_image && (
                    <li
                      onClick={() => {
                        handleDeletePhoto();
                        setOpen(false);
                      }}
                      className={styles.dropdownDanger}
                    >
                      {t("delete")}
                    </li>
                  )}
                </ul>
              )}
            </div>

            <div className={styles.form}>
              <div className={styles.row}>
                <label className={styles.label}>{t("name")}</label>
                {editingField === "name" ? (
                  <>
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder={t("name")}
                    />
                    <Input
                      value={draft.last_name}
                      onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))}
                      placeholder={t("lastName")}
                    />
                    <Button variant="primary" onClick={() => handleSave()} disabled={saving}>
                      {t("save")}
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingField(null)}>
                      {t("cancel")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className={styles.value}>{`${person.name} ${person.last_name}`.trim()}</p>
                    <Button variant="primary" className={styles.btnEdit} onClick={() => startEdit("name")}>
                      <FiEdit3 />
                    </Button>
                  </>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>{t("email")}</label>
                <p className={styles.value}>{person.email}</p>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>{t("phone")}</label>
                {editingField === "phone" ? (
                  <>
                    <Input
                      value={draft.cellphone}
                      onChange={(e) => setDraft((d) => ({ ...d, cellphone: e.target.value }))}
                      placeholder={t("phone")}
                    />
                    <Button variant="primary" onClick={() => handleSave()} disabled={saving}>
                      {t("save")}
                    </Button>
                    <Button variant="secondary" onClick={() => setEditingField(null)}>
                      {t("cancel")}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className={styles.value}>{person.cellphone || t("noPhone")}</p>
                    <Button variant="primary" className={styles.btnEdit} onClick={() => startEdit("phone")}>
                      <FiEdit3 />
                    </Button>
                  </>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>{t("password")}</label>
                <p className={styles.value}>••••••••</p>
                <Button variant="primary" className={styles.btnEdit} onClick={() => navigate("/recover-password")}>
                  <FiEdit3 />
                </Button>
              </div>
              {saveError && <p className={styles.hint}>{saveError}</p>}
            </div>

            <div className={styles.deleteSection}>
              <p className={styles.deleteQuestion}>{t("deleteQuestion")}</p>
              <Button
                variant="secondary"
                className={styles.btnDelete}
                style={{ color: "var(--color-danger)" }}
                disabled
                title={t("deleteUnavailable")}
              >
                {t("deleteAccount")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Account;
