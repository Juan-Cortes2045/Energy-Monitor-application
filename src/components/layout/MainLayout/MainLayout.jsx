import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import NotificationToasts from "../../shared/NotificationToasts/NotificationToasts";
import { NotificationCenterProvider } from "../../../context/NotificationCenterContext";
import styles from "../MainLayout/MainLayout.module.css";

const MainLayout = () => {
  return (
    <NotificationCenterProvider>
      <div
        className={styles.container}
        style={{
          "--main-bg": "var(--color-background)",
          "--main-padding": "var(--spacing-lg)",
        }}
      >
        <Sidebar />

        <main className={styles.content}>
          <Outlet />
        </main>
        <NotificationToasts />
      </div>
    </NotificationCenterProvider>
  );
};

export default MainLayout;
