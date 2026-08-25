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

const DashboardPage = () => {
  const { t } = useTranslation("dashboard");
  const { homes, addHome } = useHomes();
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

  const handleJoinHome = (code) => {
    addHome({
      id: Date.now(),
      name: t("home.joinedName"),
      userResponsible: t("home.responsible"),
      address: "Av. Central 45, Oficina 3",
      description: t("home.joinedDescription"),
      variant: "joined",
      favorite: false,
    });
  };

  const handleHomeCreated = (formData) => {
    addHome({
      id: Date.now(),
      name: formData.name,
      address: formData.address,
      description: formData.description,
      homeTypeId: formData.homeTypeId,
      otherHomeType: formData.otherHomeType,
      userResponsible: "Tú",
      variant: "owned",
      favorite: false,
    });
  };

  const handleCardClick = (home) => {
    navigate("/Consumption", {
      state: {
        home,
        isOwner: home.variant === "owned",
      },
    });
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

        {homes.length === 0 ? (
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
