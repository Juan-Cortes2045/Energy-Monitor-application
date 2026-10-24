import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "./Sidebar/Sidebar";
import NotificationToasts from "../../shared/NotificationToasts/NotificationToasts";
import ErrorBoundary from "../../shared/ErrorBoundary/ErrorBoundary";
import PageLoading from "../../shared/PageLoading/PageLoading";
import { NotificationCenterProvider } from "../../../context/NotificationCenterContext";
import styles from "../MainLayout/MainLayout.module.css";

const MAIN_ID = "main-content";

const MainLayout = () => {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();

  return (
    <NotificationCenterProvider>
      {/* Primer elemento enfocable: salta la barra lateral con teclado. */}
      <a
        href={`#${MAIN_ID}`}
        className="skip-link"
        onClick={(e) => {
          // Mueve el foco sin añadir "#main-content" a la URL.
          e.preventDefault();
          document.getElementById(MAIN_ID)?.focus();
        }}
      >
        {t("skipToContent")}
      </a>
      <div
        className={styles.container}
        style={{ "--main-padding": "var(--spacing-lg)" }}
      >
        <Sidebar />

        <main id={MAIN_ID} tabIndex={-1} className={styles.content}>
          {/* El layout sigue usable si una pantalla falla al renderizar o mientras se descarga;
              al navegar a otra ruta el error se descarta. */}
          <ErrorBoundary resetKey={pathname}>
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <NotificationToasts />
      </div>
    </NotificationCenterProvider>
  );
};

export default MainLayout;
