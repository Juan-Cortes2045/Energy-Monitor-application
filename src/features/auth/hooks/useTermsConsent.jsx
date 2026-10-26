import { useCallback, useState } from "react";
import LegalModal from "../components/LegalModal/LegalModal.jsx";

/**
 * Pide aceptar los términos y condiciones cuando el backend responde 428: la cuenta es nueva
 * (Google) o nunca los aceptó. `ask()` abre el modal legal en modo aceptación y resuelve `true`
 * si la persona acepta y `false` si lo cierra; `modal` va en el JSX del componente.
 */
export function useTermsConsent() {
  const [tab, setTab] = useState("terms");
  const [resolve, setResolve] = useState(null);

  const ask = useCallback(
    () =>
      new Promise((answer) => {
        setTab("terms");
        setResolve(() => answer);
      }),
    [],
  );

  const settle = (accepted) => {
    resolve?.(accepted);
    setResolve(null);
  };

  const modal = (
    <LegalModal
      isOpen={resolve !== null}
      activeTab={tab}
      onTabChange={setTab}
      onClose={() => settle(false)}
      onAccept={() => settle(true)}
    />
  );

  return { ask, modal };
}
