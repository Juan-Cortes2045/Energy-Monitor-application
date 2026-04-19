import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "../Sidebar/Sidebar.module.css";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";

const mockProjects = [
  { id: 1, name: "Casa de Usuario001" },
  { id: 2, name: "Casa de Usuario002" },
];

const NavProjects = ({ icon, label, collapsed }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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
        <div
          className={styles.projectList}
          style={{ marginTop: spacing.sm }}
        >
          {mockProjects.map((p) => (
            <div
              key={p.id}
              className={styles.projectItem}
              style={{ fontSize: typography.sizes.sm }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/${p.id}`);
              }}
            >
              <div className={styles.projectAvatar}>
                {p.name.charAt(0)}
              </div>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavProjects;