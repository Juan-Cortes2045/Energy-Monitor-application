import { useEffect, useRef } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"]):not([hidden])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Diálogos abiertos, del más antiguo al más reciente.
const openDialogs = [];

// El de más arriba: el último abierto que no contiene a otro diálogo abierto.
const topDialog = () =>
  openDialogs.findLast((d) => !openDialogs.some((other) => other !== d && d.contains(other)));

/**
 * Comportamiento accesible de un diálogo modal:
 * - al abrir mueve el foco dentro (respeta un autoFocus que ya esté dentro);
 * - Escape llama a onClose (solo el diálogo de más arriba si hay varios anidados);
 * - Tab y Shift+Tab no salen del diálogo;
 * - al cerrar, el foco vuelve al elemento que lo abrió.
 * Devuelve la ref del contenedor con role="dialog", que debe llevar tabIndex={-1}.
 *
 * Lo usan todos los modales de la app (ConfirmModal, cuenta, hogares, dispositivos).
 */
export function useDialogA11y(onClose) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const opener = document.activeElement;
    openDialogs.push(node);
    if (!node.contains(document.activeElement)) {
      (node.querySelector(FOCUSABLE) ?? node).focus();
    }

    const handleKeyDown = (e) => {
      if (topDialog() !== node) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = [...node.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openDialogs.splice(openDialogs.indexOf(node), 1);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  return ref;
}
