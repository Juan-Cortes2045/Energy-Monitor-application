import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "../Sidebar/Sidebar.module.css";
import { useProjects } from "../../../../context/ProjectContext";

const NavProjects = ({ icon, label, collapsed }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { projects } = useProjects();

  return (
    <div>
      {/* HEADER */}
      <div
        className={styles.link}
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      >
        {icon}

        {!collapsed && (
          <>
            <span>{label}</span>
            <span style={{ marginLeft: "auto" }}>
              {open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </span>
          </>
        )}
      </div>

      {/* LISTA */}
      {open && !collapsed && (
        <div className={`${styles.projectList} ${styles.projectListOpen}`}>
          {projects.length === 0 ? (
            <p className={styles.noProjects}>Sin proyectos</p>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                className={styles.projectItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/Consumption", {
                    state: { project: p, isOwner: p.variant === "owned" },
                  });
                }}
              >
                <div className={styles.projectAvatar}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span>{p.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NavProjects;