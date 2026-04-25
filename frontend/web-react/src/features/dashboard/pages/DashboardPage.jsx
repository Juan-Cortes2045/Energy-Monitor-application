import { useState } from "react";

import Header from "../../../design/components/Header/Header";
import ActionMenu from "../../../design/components/ActionMenu/ActionMenu";
import EmptyState from "../components/EmptyState/EmptyState";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import Consumption from "../../DetailProject/Consumption";
import { FolderPlus, Users } from "lucide-react";

const DashboardPage = () => {
  const [projects, setProjects] = useState([]);
  // null = lista  |  objeto proyecto = detalle
  const [selectedProject, setSelectedProject] = useState(null);

  /* ── Acciones del menú ─────────────────────────────────────────────── */
  const handleMenuItemClick = (item) => {
    const projectId = Date.now();

    if (item.action === "create-project") {
      setProjects((prev) => [
        {
          id: projectId,
          name: "Proyecto creado",
          userResponsible: "Tú",
          address: "Calle 123, Ciudad",
          description: "Proyecto creado por el usuario con acceso completo.",
          variant: "owned",
          favorite: false,
        },
        ...prev,
      ]);
      return;
    }

    if (item.action === "join-project") {
      setProjects((prev) => [
        {
          id: projectId,
          name: "Te has unido",
          userResponsible: "Responsable del proyecto",
          address: "Av. Central 45, Oficina 3",
          description: "Proyecto en el que te has unido como usuario regular.",
          variant: "joined",
          favorite: false,
        },
        ...prev,
      ]);
      return;
    }
  };

  const breadcrumbItems = selectedProject
    ? [
        { label: "Inicio", onClick: () => setSelectedProject(null) },
        { label: "Proyectos", onClick: () => setSelectedProject(null) },
        { label: selectedProject.name },
      ]
    : [{ label: "Inicio" }];

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

  return (
    <div>
      {/* El Header siempre visible — breadcrumb cambia según el estado */}
      <Header breadcrumbItems={breadcrumbItems}>
        <ActionMenu
          items={actionMenuItems}
          onItemClick={handleMenuItemClick}
          position="bottom-right"
        />
      </Header>

      {/* ── Vista detalle del proyecto ── */}
      {selectedProject ? (
        <Consumption
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        /* ── Lista de proyectos ── */
        <>
          {projects.length === 0 ? (
            <EmptyState
              onCreateProject={() =>
                handleMenuItemClick({ action: "create-project" })
              }
              onJoinProject={() =>
                handleMenuItemClick({ action: "join-project" })
              }
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
        </>
      )}
    </div>
  );
};

export default DashboardPage;
