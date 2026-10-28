import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import styles from "../Sidebar/Sidebar.module.css";
import { useHomes } from "../../../../context/useHomes";

const NavHomes = ({ icon, label, collapsed, onExpand, onNavigate }) => {
  const { t } = useTranslation("sidebar");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { homes } = useHomes();
  const listId = useId();
  const rootRef = useRef(null);

  // Ajuste de estado durante el render (patrón de React para reaccionar a
  // un cambio de prop sin useEffect): si el sidebar pasó a colapsado desde
  // el último render, cierra la lista en este mismo render.
  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);
  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);
    if (collapsed) setOpen(false);
  }

  // La lista se cierra al tocar o hacer clic fuera de ella.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const handleToggle = () => {
    if (collapsed) {
      onExpand?.();
      setOpen(true);
      return;
    }
    setOpen((prev) => !prev);
  };

  return (
    <div
      ref={rootRef}
      onKeyDown={(e) => {
        // Escape cierra la lista y deja el foco en su botón.
        if (e.key === "Escape" && open) {
          e.stopPropagation();
          setOpen(false);
          e.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
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
            <span style={{ marginLeft: "auto" }} aria-hidden="true">
              {open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </span>
          </>
        )}
      </button>

      {/* LISTA */}
      {open && !collapsed && (
        <div id={listId} className={`${styles.homeList} ${styles.homeListOpen}`}>
          {homes.length === 0 ? (
            <p className={styles.noHomes}>{t("noHomes")}</p>
          ) : (
            homes.map((h) => (
              <button
                type="button"
                key={h.idHome}
                className={styles.homeItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/homes/${h.idHome}`);
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                <span className={styles.homeAvatar} aria-hidden="true">
                  {h.name.charAt(0).toUpperCase()}
                </span>
                <span>{h.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NavHomes;
