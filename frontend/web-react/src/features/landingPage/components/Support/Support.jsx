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

const WHATSAPP_NUMBER = "573170400573";

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

  return (
    <div className={styles.faqItem}>
      <button
        type="button"
        className={styles.faqQuestion}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
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
      {open && (
        <p className={styles.faqAnswer}>
          <Highlight text={answer} query={query} />
        </p>
      )}
    </div>
  );
};

// ── Support ───────────────────────────────────────────────────────────────────
const Support = () => {
  const { t } = useTranslation("support");
  const [search, setSearch] = useState("");

  const email = "garmiguelangel89@gmail.com";
  const subject = encodeURIComponent(
    t("contact.email.subject", "Soporte EnergyMonitor"),
  );
  const body = encodeURIComponent(
    t(
      "contact.email.body",
      "Hola,\n\nQuiero recibir ayuda con lo siguiente:\n\n- \n\nGracias.",
    ),
  );
  const whatsappMessage = encodeURIComponent(
    t(
      "contact.whatsapp.prefilledMessage",
      "Hola, necesito ayuda con EnergyMonitor.",
    ),
  );

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

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
          <Trans i18nKey="hero.title" t={t}>
            ¿En qué podemos{" "}
            <span className={styles.heroHighlight}>ayudarte?</span>
          </Trans>
        </h1>
        <p className={styles.heroSub}>{t("hero.subtitle")}</p>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <Input
            type="search"
            placeholder={t("hero.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t(
              "hero.searchAriaLabel",
              "Buscar en preguntas frecuentes",
            )}
            style={{
              border: "none",
              boxShadow: "none",
              background: "transparent",
            }}
          />
        </div>

        {query && (
          <p className={styles.searchCount}>
            {filteredFaqIds.length === 0
              ? t("hero.searchNoResults", { query })
              : t("hero.searchResults", {
                  count: filteredFaqIds.length,
                  plural: filteredFaqIds.length > 1 ? "s" : "",
                  query,
                })}
          </p>
        )}
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
          {/* WhatsApp — usa <Card> */}
          <Card>
            <div className={styles.contactInner}>
              <svg
                className={styles.waLogo}
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="24" cy="24" r="24" fill="#25D366" />
                <path
                  d="M34.5 13.5A14.9 14.9 0 0 0 24 9C16.27 9 10 15.27 10 23a13.9 13.9 0 0 0 1.87 7L10 39l9.26-1.83A14.94 14.94 0 0 0 24 39c7.73 0 14-6.27 14-16a13.93 13.93 0 0 0-3.5-9.5ZM24 36.5a12.4 12.4 0 0 1-6.34-1.73l-.45-.27-4.69.93.95-4.56-.3-.47A12.38 12.38 0 0 1 11.5 23c0-6.9 5.6-12.5 12.5-12.5a12.5 12.5 0 0 1 12.5 12.5C36.5 30.9 30.9 36.5 24 36.5Zm6.86-9.38c-.37-.19-2.2-1.09-2.54-1.21-.34-.12-.59-.19-.84.19-.25.37-.96 1.21-1.18 1.46-.22.25-.43.28-.8.09a10.1 10.1 0 0 1-2.97-1.83 11.1 11.1 0 0 1-2.05-2.56c-.22-.37 0-.57.16-.76.16-.17.37-.43.56-.65.19-.22.25-.37.37-.62.12-.25.06-.47-.03-.65-.09-.19-.84-2.02-1.15-2.77-.3-.72-.61-.62-.84-.63h-.71c-.25 0-.65.09-.99.47s-1.3 1.27-1.3 3.1 1.33 3.6 1.52 3.85c.19.25 2.62 4 6.35 5.61a21.3 21.3 0 0 0 2.12.78 5.1 5.1 0 0 0 2.34.15c.71-.1 2.2-.9 2.51-1.76.31-.87.31-1.61.22-1.76-.09-.16-.34-.25-.71-.44Z"
                  fill="white"
                />
              </svg>
              <h3 className={styles.contactTitle}>
                {t("contact.whatsapp.title")}
              </h3>
              <p className={styles.contactDesc}>
                {t("contact.whatsapp.description")}
              </p>
              <Button
                variant="secondary"
                size="medium"
                onClick={handleWhatsApp}
                style={{
                  width: "100%",
                  backgroundColor: "#25D366",
                  color: "#fff",
                  borderColor: "#25D366",
                  marginTop: "auto",
                }}
              >
                {t("contact.whatsapp.button")}
              </Button>
            </div>
          </Card>

          {/* Correo — usa <Card> */}
          <Card>
            <div className={styles.contactInner}>
              <div className={styles.contactIconCircle}>
                <Send size={22} aria-hidden="true" />
              </div>
              <h3 className={styles.contactTitle}>
                {t("contact.email.title")}
              </h3>
              <p className={styles.contactDesc}>
                {t("contact.email.description")}
              </p>
              <Button
                variant="primary"
                size="medium"
                onClick={() => {
                  const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
                  window.open(gmailURL, "_blank");
                }}
                style={{ width: "100%", marginTop: "auto" }}
              >
                {t("contact.email.button")}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Support;
