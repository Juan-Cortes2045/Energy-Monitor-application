import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardPage.module.css";
import { useTranslation } from "react-i18next";

import Header from "../../../design/components/Header/Header";
import ActionMenu from "../../../design/components/ActionMenu/ActionMenu";
import EmptyState from "../components/EmptyState/EmptyState";
import HomeCard from "../components/HomeCard/HomeCard";
import CreateHomeModal from "../components/ModalCreateHome/CreateHomeModal";
import JoinHomeModal from "../components/ModalJoinHome/JoinHomeModal";
import { FolderPlus, Users } from "lucide-react";
import { useHomes } from "../../../context/HomeContext";
import { createHome, joinHome, setFavorite } from "../../../services/home.service";
import LoadingState from "../../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";

const DashboardPage = () => {
  const { t } = useTranslation("dashboard");
  const { homes, loading, error, refetch } = useHomes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: t("breadcrumb.home") }];

  const actionMenuItems = [
    {
      label: t("actions.joinHome"),
      icon: <Users size={20} />,
      action: "join-home",
    },
    {
      label: t("actions.createHome"),
      icon: <FolderPlus size={20} />,
      action: "create-home",
    },
  ];

  const handleMenuItemClick = (item) => {
    if (item.action === "create-home") {
      setShowCreateModal(true);
      return;
    }
    if (item.action === "join-home") {
      setShowJoinModal(true);
    }
  };

  const handleJoinHome = async (code) => {
    await joinHome(code);
    await refetch();
  };

  const handleHomeCreated = async (payload) => {
    await createHome(payload);
    await refetch();
  };

  const handleToggleFavorite = async (home, nextFavorite) => {
    try {
      await setFavorite(home.id, nextFavorite);
      await refetch();
    } catch {
      // Optimistic UI isn't used here since refetch() already re-syncs from
      // the server on both success and (harmlessly) on failure.
    }
  };

  const handleCardClick = (home) => {
    navigate(`/homes/${home.id}`);
  };

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        <Header breadcrumbItems={breadcrumbItems}>
          <ActionMenu
            items={actionMenuItems}
            onItemClick={handleMenuItemClick}
            position="bottom-right"
          />
        </Header>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : homes.length === 0 ? (
          <EmptyState
            onCreateHome={() => setShowCreateModal(true)}
            onJoinHome={() => setShowJoinModal(true)}
          />
        ) : (
          <div className={styles.homesGrid}>
            {homes.map((home) => (
              <HomeCard
                key={home.id}
                home={home}
                onClick={() => handleCardClick(home)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateHomeModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleHomeCreated}
          />
        )}

        {showJoinModal && (
          <JoinHomeModal
            onClose={() => setShowJoinModal(false)}
            onSubmit={handleJoinHome}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
