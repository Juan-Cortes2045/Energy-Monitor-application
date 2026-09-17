import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../design/components/Button/Button";

// Shared shell for the three route-guard dead ends: home not found (404),
// no access to a home (403), and the catch-all page-not-found. `i18nKey`
// picks the { title, message, cta } group from routeGuards.json.
const GuardScreen = ({ i18nKey }) => {
  const { t } = useTranslation("routeGuards");
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "var(--spacing-md)",
        textAlign: "center",
        padding: "var(--spacing-lg)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-primary)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--font-size-xl)",
          color: "var(--color-text-primary)",
        }}
      >
        {t(`${i18nKey}.title`)}
      </h2>
      <p style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}>
        {t(`${i18nKey}.message`)}
      </p>
      <Button variant="primary" onClick={() => navigate("/dashboard")}>
        {t(`${i18nKey}.cta`)}
      </Button>
    </div>
  );
};

export default GuardScreen;
