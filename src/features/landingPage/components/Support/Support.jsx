import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";

import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";

import {
  Search,
  ChevronRight,
  ChevronDown,
  Send,
  Zap,
  BarChart2,
  Users,
  Bell,
  Key,
  Settings,
} from "lucide-react";

import { openSupportTicket, useSupportContacts } from "./useSupportContacts";
import styles from "./Support.module.css";

// ── Iconos por tema (no se traducen, solo se mapean por id) ──────────────────
const TOPIC_ICONS = {
  1: <Zap size={20} />,
  2: <BarChart2 size={20} />,
  3: <Users size={20} />,
  4: <Bell size={20} />,
  5: <Key size={20} />,
  6: <Settings size={20} />,
};

// IDs en orden fijo (el contenido real sale de support.json vía t())
const TOPIC_IDS = [1, 2, 3, 4, 5, 6];
const FAQ_IDS = [1, 2, 3, 4, 5];

// ── Normaliza texto (quita tildes) para búsqueda más flexible ────────────────
const normalize = (str) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// ── Resalta la palabra encontrada en el texto ─────────────────────────────────
const Highlight = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        normalize(part).includes(normalize(query)) ? (
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
};

// ── TopicCard — usa <Card> ────────────────────────────────────────────────────
const TopicCard = ({ id }) => {
  const { t } = useTranslation("support");
  return (
    <Card>
      <div className={styles.topicInner}>
        <div className={styles.topicIconWrap} aria-hidden="true">
          {TOPIC_ICONS[id]}
        </div>
        <h3 className={styles.topicTitle}>{t(`topics.items.${id}.title`)}</h3>
        <p className={styles.topicDesc}>
          {t(`topics.items.${id}.description`)}
        </p>
      </div>
    </Card>
  );
};

// ── FaqItem — acordeón ────────────────────────────────────────────────────────
const FaqItem = ({ id, query }) => {
  const { t } = useTranslation("support");
  const [open, setOpen] = useState(false);
  const question = t(`faq.items.${id}.question`);
  const answer = t(`faq.items.${id}.answer`);
  const answerId = `faq-answer-${id}`;

  return (
    <div className={styles.faqItem}>
      <button
        type="button"
        className={styles.faqQuestion}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={answerId}
      >
        <span>
          <Highlight text={question} query={query} />
        </span>
        {open ? (
          <ChevronDown size={16} aria-hidden="true" />
        ) : (
          <ChevronRight size={16} aria-hidden="true" />
        )}
      </button>
      <p id={answerId} className={styles.faqAnswer} hidden={!open}>
        <Highlight text={answer} query={query} />
      </p>
    </div>
  );
};

// ── Support ───────────────────────────────────────────────────────────────────
const Support = () => {
  const { t } = useTranslation("support");
  const [search, setSearch] = useState("");

  const subject = t("contact.email.subject");
  const body = t("contact.email.body");

  // Los administradores son el contacto de soporte; con varios, la persona elige a quién escribir.
  const { contacts, selectedEmail, setSelectedEmail } = useSupportContacts();

  const handleEmail = () => openSupportTicket(selectedEmail, subject, body);

  const onlyContact = contacts.list.length === 1 ? contacts.list[0] : null;
  const noContact = contacts.status === "error" || (contacts.status === "ready" && contacts.list.length === 0);

  // Busca en pregunta Y en respuesta (ya traducidas), con normalización de tildes
  const query = search.trim();
  const normalQuery = normalize(query);
  const filteredFaqIds = query
    ? FAQ_IDS.filter((id) => {
        const question = t(`faq.items.${id}.question`);
        const answer = t(`faq.items.${id}.answer`);
        return (
          normalize(question).includes(normalQuery) ||
          normalize(answer).includes(normalQuery)
        );
      })
    : FAQ_IDS;

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          <Trans
            i18nKey="hero.title"
            t={t}
            components={{ hl: <span className={styles.heroHighlight} /> }}
          />
        </h1>
        <p className={styles.heroSub}>{t("hero.subtitle")}</p>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <Input
            type="search"
            variant="bare"
            placeholder={t("hero.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("hero.searchLabel")}
          />
        </div>

        {/* Región viva siempre montada: el lector anuncia el número de resultados al escribir */}
        <p className={styles.searchCount} role="status">
          {query &&
            (filteredFaqIds.length === 0
              ? t("hero.searchNoResults", { query })
              : t("hero.searchResults", { count: filteredFaqIds.length, query }))}
        </p>
      </section>

      {/* ── Temas populares ──────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("topics.title")}</h2>
        <div className={styles.topicsGrid}>
          {TOPIC_IDS.map((id) => (
            <TopicCard key={id} id={id} />
          ))}
        </div>
      </section>

      {/* ── Preguntas frecuentes ─────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("faq.title")}</h2>
        <div className={styles.faqList}>
          {filteredFaqIds.length > 0 ? (
            filteredFaqIds.map((id) => (
              <FaqItem key={id} id={id} query={query} />
            ))
          ) : (
            <div className={styles.faqEmpty}>
              <p className={styles.faqEmptyMsg}>{t("faq.empty", { query })}</p>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setSearch("")}
              >
                {t("faq.showAll")}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("contact.title")}</h2>
        <div className={styles.contactGrid}>
          {/* Correo a los administradores — usa <Card> */}
          <Card>
            <div className={styles.contactInner}>
              <div className={styles.contactIconCircle} aria-hidden="true">
                <Send size={22} />
              </div>
              <h3 className={styles.contactTitle}>
                {t("contact.email.title")}
              </h3>
              <p className={styles.contactDesc}>
                {t("contact.email.description")}
              </p>

              {contacts.status === "loading" && (
                <p className={styles.contactDesc} role="status">
                  {t("contact.email.loading")}
                </p>
              )}

              {noContact && (
                <p className={styles.contactNotice} role="status">
                  {t("contact.email.unavailable")}
                </p>
              )}

              {/* Varios administradores: se elige a quién escribir */}
              {contacts.list.length > 1 && (
                <div className={styles.contactChoice}>
                  <label htmlFor="support-contact" className={styles.contactLabel}>
                    {t("contact.email.chooseLabel")}
                  </label>
                  <select
                    id="support-contact"
                    className={styles.contactSelect}
                    value={selectedEmail}
                    onChange={(e) => setSelectedEmail(e.target.value)}
                  >
                    {contacts.list.map((contact) => (
                      <option key={contact.email} value={contact.email}>
                        {contact.name === contact.email
                          ? contact.email
                          : `${contact.name} (${contact.email})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {contacts.list.length > 0 && (
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleEmail}
                  className={styles.contactButton}
                >
                  {onlyContact
                    ? t("contact.email.buttonTo", { name: onlyContact.name })
                    : t("contact.email.button")}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Support;
