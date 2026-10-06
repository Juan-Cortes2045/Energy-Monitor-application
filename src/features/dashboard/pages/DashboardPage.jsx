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
import { useHomes } from "../../../context/useHomes";
import * as homeApi from "../../../services/home";

const DashboardPage = () => {
  const { t } = useTranslation("dashboard");
  const { homes, loading, error, reload, addHome, joinHome, setFavorite } =
    useHomes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [homeTypes, setHomeTypes] = useState([]);
  const [createError, setCreateError] = useState(null);
  const [joinError, setJoinError] = useState(null);
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
      setCreateError(null);
      // Carga el catálogo de tipos cada vez que se abre el modal
      homeApi.homeApi
        .listHomeTypes()
        .then(setHomeTypes)
        .catch(() => setHomeTypes([]));
      setShowCreateModal(true);
      return;
    }
    if (item.action === "join-home") {
      setJoinError(null);
      setShowJoinModal(true);
    }
  };

  const handleCreateHome = async (formData) => {
    const err = await addHome({
      name: formData.name,
      homeTypeId: formData.homeTypeId,
      address: formData.address,
      description: formData.description,
    });
    if (err) {
      setCreateError(err);
      return false;
    }
    setShowCreateModal(false);
    return true;
  };

  const handleJoinHome = async (code) => {
    const err = await joinHome(code);
    if (err) {
      setJoinError(err);
      return false;
    }
    setShowJoinModal(false);
    return true;
  };

  const handleCardClick = (home) => {
    navigate(`/homes/${home.idHome}`);
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

        {loading && <p className={styles.state} role="status">{t("state.loading")}</p>}

        {error && (
          <div className={styles.state} role="alert">
            <p>{t("state.error")}</p>
            <button type="button" onClick={reload}>{t("state.retry")}</button>
          </div>
        )}

        {!loading && !error && homes.length === 0 && (
          <EmptyState
            onCreateHome={() => handleMenuItemClick({ action: "create-home" })}
            onJoinHome={() => handleMenuItemClick({ action: "join-home" })}
          />
        )}

        {!loading && !error && homes.length > 0 && (
          <div className={styles.homesGrid}>
            {homes.map((home) => (
              <HomeCard
                key={home.idHome}
                home={home}
                onClick={() => handleCardClick(home)}
                onToggleFavorite={(id) => setFavorite(id)}
              />
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateHomeModal
            types={homeTypes}
            serverError={createError}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateHome}
          />
        )}

        {showJoinModal && (
          <JoinHomeModal
            serverError={joinError}
            onClose={() => setShowJoinModal(false)}
            onSubmit={handleJoinHome}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
