import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../pages/DashboardPage.module.css"
import Header from "../../../design/components/Header/Header";
import ActionMenu from "../../../design/components/ActionMenu/ActionMenu";
import EmptyState from "../components/EmptyState/EmptyState";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import Consumption from "../../DetailProject/Consumption";
import CreateProjectModal from "../../DetailProject/CreateProjectModal";
import { FolderPlus, Users } from "lucide-react";

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "Inicio" }];

  const actionMenuItems = [
    {
      label: "Unirme a Proyecto",
      icon: <Users size={20} />,
      action: "join-project",
    },
    {
      label: "Crear Proyecto",
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
          name: "Proyecto unido",
          userResponsible: "Responsable del proyecto",
          address: "Av. Central 45, Oficina 3",
          description: "Proyecto en el que te has unido como usuario regular.",
          variant: "joined",
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

  return (
    <div>
      <div className={styles.header}>
        <Header breadcrumbItems={breadcrumbItems}>
          <ActionMenu
            items={actionMenuItems}
            onItemClick={handleMenuItemClick}
            position="bottom-right"
          />
        </Header>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          onCreateProject={() => setShowCreateModal(true)}
          onJoinProject={() => handleMenuItemClick({ action: "join-project" })}
        />
      ) : selectedProject ? (
        <Consumption
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <div
          style={{
            padding: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProject(project)}
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
  );
};

export default DashboardPage;
