import { useEffect, useState } from "react";

import { getSupportContacts } from "../../../../services/support";

/**
 * Los administradores son el contacto de soporte: los carga una vez y, con varios, deja elegir a
 * quién escribir. Lo comparten la página de soporte de la portada y el modal de Ajustes.
 *
 * @returns {{ contacts: {status: "loading"|"ready"|"error", list: {name: string, email: string}[]},
 *   selectedEmail: string, setSelectedEmail: (email: string) => void }}
 */
export function useSupportContacts() {
  const [contacts, setContacts] = useState({ status: "loading", list: [] });
  const [selectedEmail, setSelectedEmail] = useState("");

  useEffect(() => {
    let active = true;
    getSupportContacts()
      .then((list) => {
        if (!active) return;
        setContacts({ status: "ready", list });
        setSelectedEmail(list[0]?.email ?? "");
      })
      .catch(() => active && setContacts({ status: "error", list: [] }));
    return () => {
      active = false;
    };
  }, []);

  return { contacts, selectedEmail, setSelectedEmail };
}

/** Abre fuera de la app, sin darle a la otra pestaña acceso a window.opener. */
const openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer");

/** Abre el correo al contacto elegido, con el asunto y el texto de ayuda ya escritos. */
export function openSupportTicket(email, subject, body) {
  if (!email) return;
  openExternal(
    `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  );
}
