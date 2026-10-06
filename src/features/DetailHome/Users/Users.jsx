import { useState } from "react";
import Card from "../../../design/components/Card/Card";
import styles from "./Users.module.css";
import { useTranslation } from "react-i18next";

const mockUsers = [
  {
    id: 1,
    name: "Carlos",
    lastName: "García",
    email: "carlos.garcia@email.com",
    role: "owner",
  },
  {
    id: 2,
    name: "Ana",
    lastName: "Martínez",
    email: "ana.m@email.com",
    role: "member",
  },
  {
    id: 3,
    name: "Luis",
    lastName: "Pérez",
    email: "luis.perez@email.com",
    role: "member",
  },
  {
    id: 4,
    name: "Sofía",
    lastName: "Ramos",
    email: "sofia.ramos@empresa.co",
    role: "member",
  },
];
import { useMembers } from "../../home/hooks/useMembers";
import { useHomes } from "../../../context/useHomes";

// El backend separa `name` y `lastName`; las iniciales se siguen tomando de los
// dos para no perder la que aportaba el apellido dentro del nombre completo.
const getInitials = (name = "", lastName = "") =>
  [name, lastName]
    .map((word) => word.trim().split(" ")[0]?.[0]?.toUpperCase() ?? "")
    .join("");

const fullName = (user) => [user.name, user.lastName].filter(Boolean).join(" ");

const AVATAR_COLORS = ["blue", "green", "amber", "purple"];

const Avatar = ({ name, lastName, index }) => (
  <div
    className={`${styles.avatar} ${styles[`avatar_${AVATAR_COLORS[index % AVATAR_COLORS.length]}`]}`}
  >
    {getInitials(name, lastName)}
  </div>
);

const UserRow = ({ user, index, isOwner, onRemove, t }) => (
  <div className={styles.userRow}>
    <Avatar name={user.name} lastName={user.lastName} index={index} />
    <div className={styles.userInfo}>
      <p className={styles.userName}>{fullName(user)}</p>
      <p className={styles.userEmail}>{user.email}</p>
    </div>
    <span
      className={`${styles.badge} ${
        user.role === "owner" ? styles.badgeOwner : styles.badgeMember
      }`}
    >
      {user.role === "owner" ? t("roles.owner") : t("roles.member")}
    </span>
    {isOwner && user.role !== "owner" && (
      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(user.id)}
        aria-label={t("actions.removeUser", { name: fullName(user) })}
      >
        ×
      </button>
    )}
  </div>
);

const Users = ({ home, isOwner = false }) => {
  /**
   * Miembros conectados al backend:
   * - GET /homes/{id}/members al montar
   * - DELETE /homes/{id}/members/{userId} para remover (solo OWNER)
   * La API no expone nombres ni invitaciones: se muestra el userId.
   */
  const Users = ({ home, isOwner = false }) => {
    const { t } = useTranslation("users");
    const { removeMember } = useHomes();
    const { members, loading, error, reload } = useMembers(home?.idHome);
    const [removingId, setRemovingId] = useState(null);
    const [removeError, setRemoveError] = useState(null);

    const handleRemove = async (userId) => {
      setRemovingId(userId);
      setRemoveError(null);
      const err = await removeMember(home.idHome, userId);
      setRemovingId(null);
      if (err) setRemoveError(err);
    };

    return (
      <div className={styles.page}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("header.title")}</h2>
          <p className={styles.sectionSub}>
            {t("header.membersCount", { count: members.length })}
          </p>
        </div>

        {loading && (
          <p className={styles.state} role="status">
            {t("state.loading")}
          </p>
        )}

        {error && (
          <div className={styles.state} role="alert">
            <p>{t("state.error")}</p>
            <button type="button" onClick={reload}>
              {t("state.retry")}
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.cardMembers}>
            <Card>
              <div className={styles.listBlock}>
                <p className={styles.blockTitle}>{t("members.title")}</p>
                {members.length === 0 && (
                  <p className={styles.state}>{t("members.empty")}</p>
                )}
                <div className={styles.userList}>
                  {members.map((user, i) => (
                    <div key={user.userId} className={styles.userRow}>
                      <Avatar name={user.userId} index={i} />
                      <div className={styles.userInfo}>
                        <p className={styles.userName}>{user.userId}</p>
                        <p className={styles.userEmail}>{user.userId}</p>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          user.role === "OWNER"
                            ? styles.badgeOwner
                            : styles.badgeMember
                        }`}
                      >
                        {user.role === "OWNER"
                          ? t("roles.owner")
                          : t("roles.member")}
                      </span>
                      {isOwner && user.role !== "OWNER" && (
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => handleRemove(user.userId)}
                          disabled={removingId === user.userId}
                          aria-label={t("actions.removeUser", {
                            name: user.userId,
                          })}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {removeError && (
                  <p className={styles.inviteError} role="alert">
                    {removeError.status === 409
                      ? t("removeErrors.conflict")
                      : removeError.message}
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  };
};
export default Users;
