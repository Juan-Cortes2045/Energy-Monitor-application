import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardPage";
import { useTranslation } from "react-i18next";

import Header from "../../../design/components/Header/Header";
import ActionMenu from "../../../design/components/ActionMenu/ActionMenu";
import EmptyState from "../components/EmptyState/EmptyState";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import CreateProjectModal from "../components/ModalCreateProject/CreateProjectModal";
import { FolderPlus, Users } from "lucide-react";

const DashboardPage = () => {
  const { t } = useTranslation("dashboard");
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: t("breadcrumb.home") }];

  const actionMenuItems = [
    {
      label: t("actions.joinProject"),
      icon: <Users size={20} />,
      action: "join-project",
    },
    {
      label: t("actions.createProject"),
      icon: <FolderPlus size={20} />,
      action: "create-project",
    },
  ];

  const handleMenuItemClick = (item) => {
    if (item.action === "create-project") {
      setShowCreateModal(true);
      return;
    }
    if (item.action === "join-project") {
      setProjects((prev) => [
        {
          id: Date.now(),
          name: t("project.joinedName"),
          userResponsible: t("project.responsible"),
          address: "Av. Central 45, Oficina 3",
          description: t("project.joinedDescription"),
          variant: t("project.you"),
          favorite: false,
        },
        ...prev,
      ]);
    }
  };

  const handleProjectCreated = (formData) => {
    setProjects((prev) => [
      {
        id: Date.now(),
        name: formData.name,
        address: formData.address,
        description: formData.description,
        projectTypeId: formData.projectTypeId,
        otherProjectType: formData.otherProjectType,
        userResponsible: "Tú",
        variant: "owned",
        favorite: false,
      },
      ...prev,
    ]);
  };

  const handleCardClick = (project) => {
    navigate("/Consumption", {
      state: {
        project,
        isOwner: project.variant === "owned",
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

        {projects.length === 0 ? (
          <EmptyState
            onCreateProject={() => setShowCreateModal(true)}
            onJoinProject={() =>
              handleMenuItemClick({ action: "join-project" })
            }
          />
        ) : (
          <div className={styles.projectsGrid}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleCardClick(project)}
              />
            ))}
          </div>
        )}

        {/* ── Modal — fuera del flujo para no afectar el layout ──────── */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleProjectCreated}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;