import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

import styles from "../Sidebar/Sidebar.module.css";
import { useHomes } from "../../../../context/HomeContext";

const NavHomes = ({ icon, label, collapsed, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { homes } = useHomes();

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
        <div className={`${styles.homeList} ${styles.homeListOpen}`}>
          {homes.length === 0 ? (
            <p className={styles.noHomes}>Sin hogares</p>
          ) : (
            homes.map((h) => (
              <div
                key={h.id}
                className={styles.homeItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/Consumption", {
                    state: { home: h, isOwner: h.variant === "owned" },
                  });
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
