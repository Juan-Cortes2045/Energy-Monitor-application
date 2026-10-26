import { useEffect } from "react";

/**
 * Hook para actualizar el título del documento dinámicamente según la página actual.
 * @param {string} title Título específico de la página
 * @param {string} [description] Meta descripción opcional
 */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    const defaultTitle = "EnergyMonitor - Control y Monitoreo de Consumo Eléctrico";
    if (title) {
      document.title = `${title} | EnergyMonitor`;
    } else {
      document.title = defaultTitle;
    }

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", description);
      }
    }
  }, [title, description]);
}

export default useDocumentTitle;
