import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "../Sidebar/Sidebar.module.css";
import { useHomes } from "../../../../context/HomeContext";

const NavHomes = ({ icon, label, collapsed, onExpand, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { homes } = useHomes();
  const listId = useId();

  // Ajuste de estado durante el render (patrón de React para reaccionar a
  // un cambio de prop sin useEffect): si el sidebar pasó a colapsado desde
  // el último render, cierra la lista en este mismo render.
  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);
  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);
    if (collapsed) setOpen(false);
  }

  const handleToggle = () => {
    if (collapsed) {
      onExpand?.();
      setOpen(true);
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <div>
      {/* HEADER */}
      <button
        type="button"
        className={`${styles.link} ${styles.homesToggle}`}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
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
      </button>

      {/* LISTA */}
      {open && !collapsed && (
        <div id={listId} className={`${styles.homeList} ${styles.homeListOpen}`}>
          {homes.length === 0 ? (
            <p className={styles.noHomes}>Sin hogares</p>
          ) : (
            homes.map((h) => (
              <div
                key={h.id}
                className={styles.homeItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/homes/${h.id}`);
                  onNavigate?.();
                }}
              >
                <div className={styles.homeAvatar}>
                  {h.name.charAt(0).toUpperCase()}
                </div>
                <span>{h.name}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NavHomes;
