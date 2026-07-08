import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";

import {
  AlertTriangle,
  Target,
  Eye,
  ShieldCheck,
  PiggyBank,
  Leaf,
  Sparkles,
  Cpu,
  TrendingDown,
  LayoutGrid,
  Clock,
  ArrowRight,
} from "lucide-react";

import styles from "./About.module.css";

// ── Iconos por id (no se traducen, solo se mapean) ───────────────────────────
const STORY_ICONS = {
  problem: <AlertTriangle size={20} />,
  mission: <Target size={20} />,
  vision: <Eye size={20} />,
};

const VALUE_ICONS = {
  transparency: <ShieldCheck size={20} />,
  saving: <PiggyBank size={20} />,
  sustainability: <Leaf size={20} />,
  simplicity: <Sparkles size={20} />,
};

const IMPACT_ICONS = {
  reduction: <TrendingDown size={20} />,
  coverage: <LayoutGrid size={20} />,
  monitoring: <Clock size={20} />,
};

const STORY_IDS = ["problem", "mission", "vision"];
const VALUE_IDS = ["transparency", "saving", "sustainability", "simplicity"];
const IMPACT_IDS = ["reduction", "coverage", "monitoring"];

const TEAM_IDS = ["1", "2"];

const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const About = () => {
  const { t } = useTranslation("about");
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {t("hero.titlePart1")}{" "}
          <span className={styles.heroHighlight}>
            {t("hero.titleHighlight")}
          </span>
        </h1>
        <p className={styles.heroSub}>{t("hero.subtitle")}</p>
      </section>

      {/* ── Nuestra historia (problema / misión / visión) ───────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("story.title")}</h2>
        <div className={styles.storyGrid}>
          {STORY_IDS.map((id) => (
            <Card key={id}>
              <div className={styles.storyInner}>
                <div className={styles.iconWrap} aria-hidden="true">
                  {STORY_ICONS[id]}
                </div>
                <h3 className={styles.cardTitle}>
                  {t(`story.items.${id}.title`)}
                </h3>
                <p className={styles.cardDesc}>
                  {t(`story.items.${id}.description`)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Valores ──────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("values.title")}</h2>
        <div className={styles.valuesGrid}>
          {VALUE_IDS.map((id) => (
            <Card key={id}>
              <div className={styles.storyInner}>
                <div className={styles.iconWrap} aria-hidden="true">
                  {VALUE_ICONS[id]}
                </div>
                <h3 className={styles.cardTitle}>
                  {t(`values.items.${id}.title`)}
                </h3>
                <p className={styles.cardDesc}>
                  {t(`values.items.${id}.description`)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Cómo lo hacemos posible ──────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.howIconWrap} aria-hidden="true">
          <Cpu size={26} />
        </div>
        <h2 className={styles.howTitle}>{t("how.title")}</h2>
        <p className={styles.howDesc}>{t("how.description")}</p>
        <Button variant="secondary" size="medium" onClick={() => navigate("/how-it-works")}>
          {t("how.button")}
        </Button>
      </section>

      {/* ── Lo que buscamos lograr ───────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("impact.title")}</h2>
        <div className={styles.impactGrid}>
          {IMPACT_IDS.map((id) => (
            <div key={id} className={styles.impactItem}>
              <div className={styles.iconWrap} aria-hidden="true">
                {IMPACT_ICONS[id]}
              </div>
              <span className={styles.impactValue}>
                {t(`impact.items.${id}.value`)}
              </span>
              <p className={styles.impactLabel}>
                {t(`impact.items.${id}.label`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Equipo ───────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("team.title")}</h2>
        <p className={styles.teamSubtitle}>{t("team.subtitle")}</p>
        <div className={styles.teamGrid}>
          {TEAM_IDS.map((id) => {
            const name = t(`team.members.${id}.name`);
            return (
              <Card key={id}>
                <div className={styles.storyInner}>
                  <div className={styles.avatar} aria-hidden="true">
                    {getInitials(name)}
                  </div>
                  <h3 className={styles.cardTitle}>{name}</h3>
                  <p className={styles.teamRole}>
                    {t(`team.members.${id}.role`)}
                  </p>
                  <p className={styles.teamFunctions}>
                    {t(`team.members.${id}.functions`)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>{t("cta.title")}</h2>
        <p className={styles.ctaSub}>{t("cta.subtitle")}</p>
        <div className={styles.ctaActions}>
          <Button
            variant="primary"
            size="medium"
            onClick={() => navigate("/register")}
          >
            {t("cta.primaryButton")}
            <ArrowRight size={16} style={{ marginLeft: 6 }} />
          </Button>
          <Button variant="secondary" size="medium" onClick={() => navigate("/login")}>
            {t("cta.secondaryButton")}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;
