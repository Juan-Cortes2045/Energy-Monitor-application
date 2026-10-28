import { useTranslation } from "react-i18next";

import Button from "../../../../design/components/Button/Button";
import {
  openSupportTicket,
  useSupportContacts,
} from "../../../landingPage/components/Support/useSupportContacts";
import HelpModal from "./HelpModal";
import styles from "./SupportModal.module.css";

/**
 * Soporte técnico desde Ajustes: una explicación breve y el botón para crear el ticket (un correo
 * a un administrador con el asunto escrito). Los contactos y el correo son los mismos de la
 * página de soporte de la portada (`useSupportContacts`), que sigue teniendo las preguntas
 * frecuentes.
 */
const SupportModal = ({ onClose }) => {
  const { t } = useTranslation("support");
  const { t: ts } = useTranslation("settings");
  const { contacts, selectedEmail, setSelectedEmail } = useSupportContacts();

  const onlyContact = contacts.list.length === 1 ? contacts.list[0] : null;
  const noContact = contacts.status === "error" || (contacts.status === "ready" && contacts.list.length === 0);
  const steps = ts("help.supportModal.steps", { returnObjects: true });

  return (
    <HelpModal title={ts("help.support.title")} closeLabel={ts("help.close")} onClose={onClose}>
      <p className={styles.intro}>{ts("help.supportModal.intro")}</p>
      <ol className={styles.steps}>
        {(Array.isArray(steps) ? steps : []).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      {contacts.status === "loading" && (
        <p className={styles.notice} role="status">
          {t("contact.email.loading")}
        </p>
      )}
      {noContact && (
        <p className={styles.notice} role="status">
          {t("contact.email.unavailable")}
        </p>
      )}

      {contacts.list.length > 1 && (
        <div className={styles.choice}>
          <label htmlFor="settings-support-contact" className={styles.label}>
            {t("contact.email.chooseLabel")}
          </label>
          <select
            id="settings-support-contact"
            className={styles.select}
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
          >
            {contacts.list.map((contact) => (
              <option key={contact.email} value={contact.email}>
                {contact.name === contact.email ? contact.email : `${contact.name} (${contact.email})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {contacts.list.length > 0 && (
        <Button
          variant="primary"
          size="medium"
          onClick={() => openSupportTicket(selectedEmail, t("contact.email.subject"), t("contact.email.body"))}
        >
          {onlyContact ? t("contact.email.buttonTo", { name: onlyContact.name }) : ts("help.support.action")}
        </Button>
      )}
    </HelpModal>
  );
};

export default SupportModal;
