import { useTranslation } from "react-i18next";

// Minimal loading placeholder shown by ProtectedRoute/PublicOnlyRoute while
// AuthContext is rehydrating the session, and by HomeMemberRoute while it
// verifies membership. Not part of the design system (src/design/) — it's a
// routing-level state, kept intentionally plain (no new CSS module).
const RouteLoading = () => {
  const { t } = useTranslation("routeGuards");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-primary)",
        fontSize: "var(--font-size-md)",
      }}
    >
      {t("loading")}
    </div>
  );
};

export default RouteLoading;
