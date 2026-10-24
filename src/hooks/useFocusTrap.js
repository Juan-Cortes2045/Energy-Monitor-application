import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Mientras `active`, Tab y Shift+Tab no salen de `ref` (diálogos, menú lateral en móvil),
 * Escape llama a `onEscape` y, al desactivarse, el foco vuelve a donde estaba antes de abrir.
 * `initialFocus` (opcional) es el ref del elemento que recibe el foco al abrir; si no, el primero.
 *
 * Escucha en el contenedor (no en document) para que con dos capas abiertas (un diálogo sobre
 * otro) Escape cierre solo la de arriba.
 */
export function useFocusTrap(ref, active, { onEscape, initialFocus } = {}) {
  // Siempre la última versión de onEscape, sin reiniciar la trampa cuando cambia.
  const escapeRef = useRef(onEscape);
  useEffect(() => {
    escapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const container = ref.current;
    const previous = document.activeElement;
    // Solo los visibles (p. ej. el botón de contraer no existe en móvil); si no hay medidas
    // (jsdom), todos.
    const focusables = () => {
      const all = [...container.querySelectorAll(FOCUSABLE)];
      const visible = all.filter((el) => el.getClientRects().length > 0);
      return visible.length > 0 ? visible : all;
    };

    (initialFocus?.current ?? focusables()[0] ?? container).focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        escapeRef.current?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
    // initialFocus se lee solo al abrir: cambiarlo no debe reiniciar la trampa ni robar el foco.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}
