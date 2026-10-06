import { useState } from "react";
import Card from "../../../design/components/Card/Card";
import styles from "./Users.module.css";
import { useTranslation } from "react-i18next";
import { useMembers } from "../../home/hooks/useMembers";
import { useHomes } from "../../../context/useHomes";

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const AVATAR_COLORS = ["blue", "green", "amber", "purple"];

const Avatar = ({ name, index }) => (
  <div
    className={`${styles.avatar} ${styles[`avatar_${AVATAR_COLORS[index % AVATAR_COLORS.length]}`]}`}
  >
    {getInitials(name)}
  </div>
);

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

      {loading && <p className={styles.state} role="status">{t("state.loading")}</p>}

      {error && (
        <div className={styles.state} role="alert">
          <p>{t("state.error")}</p>
          <button type="button" onClick={reload}>{t("state.retry")}</button>
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
                        user.role === "OWNER" ? styles.badgeOwner : styles.badgeMember
                      }`}
                    >
                      {user.role === "OWNER" ? t("roles.owner") : t("roles.member")}
                    </span>
                    {isOwner && user.role !== "OWNER" && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemove(user.userId)}
                        disabled={removingId === user.userId}
                        aria-label={t("actions.removeUser", { name: user.userId })}
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

export default Users;
