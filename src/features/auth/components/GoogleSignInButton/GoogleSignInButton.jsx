import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import googleIcon from "../../../../assets/google_icon.webp";
import Button from "../../../../design/components/Button/Button.jsx";
import styles from "./GoogleSignInButton.module.css";
import { loginWithGoogle } from "../../../../services/auth/authApi";
import { GoogleSignInError, requestGoogleCode } from "../../../../services/auth/googleSignIn";
import { errorMessage } from "../../../../services/http/errorMessages";
import { landingPath } from "../../../../services/auth/session";

/**
 * Botón "Continuar con Google" del login y del registro: abre la ventana de Google, el backend
 * crea la cuenta la primera vez (nombre, apellido, foto y correo de Google) y entra al panel.
 *
 * @param {string} label texto del botón
 * @param {(message: string) => void} onError mensaje listo para mostrar ("" lo limpia)
 */
const GoogleSignInButton = ({ label, onError }) => {
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    onError("");
    setBusy(true);
    try {
      const code = await requestGoogleCode();
      await loginWithGoogle(code);
      navigate(landingPath());
    } catch (e) {
      if (e instanceof GoogleSignInError) {
        // Cerrar la ventana de Google no es un error que haya que mostrar.
        if (e.reason !== "cancelled") onError(t("errors:googleLogin.unavailable"));
      } else {
        onError(errorMessage(t, e, "googleLogin"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className={styles.googleButton}
      icon={googleIcon}
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy}
    >
      {busy ? tc("loading") : label}
    </Button>
  );
};

export default GoogleSignInButton;
