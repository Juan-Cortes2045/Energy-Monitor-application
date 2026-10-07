import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import { useState } from "react";
import Card from "../../../design/components/Card/Card";
import styles from "./Users.module.css";
import { useTranslation } from "react-i18next";

import { useMembers } from "../hooks/useMembers";
import { useHomes } from "../../../context/useHomes";
import { getCurrentPerson } from "../../../services/auth/session";
import { errorMessage } from "../../../services/http/errorMessages";

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

const UserRow = ({ user, index, isOwner, onRemove, removing = false, t }) => (
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
        onClick={() => onRemove(user)}
        disabled={removing}
        aria-label={t("actions.removeUser", { name: fullName(user) })}
      >
        ×
      </button>
    )}
  </div>
);

/**
 * Miembros conectados al backend:
 * - GET /homes/{id}/members al montar
 * - DELETE /homes/{id}/members/{userId} para remover (solo OWNER)
 * El backend aún solo devuelve userId y rol: nombre y correo se completan para el
 * usuario en sesión; el resto usa name/lastName/email cuando el backend los traiga
 * y, mientras tanto, el userId.
 */
const toRow = (member, me) => {
  const isMe = me?.id === member.userId;
  return {
    id: member.userId,
    name: member.name || (isMe && me.name) || member.userId,
    lastName: member.lastName || (isMe ? me.lastName : ""),
    email: member.email || (isMe ? me.email : ""),
    role: member.role === "OWNER" ? "owner" : "member",
  };
};

const Users = ({ home, isOwner = false }) => {
  const { t } = useTranslation("users");
  const { removeMember } = useHomes();
  const { members, loading, error, reload } = useMembers(home?.idHome);
  const [removingId, setRemovingId] = useState(null);
  const [confirmingUser, setConfirmingUser] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  const me = getCurrentPerson();
  const rows = members.map((m) => toRow(m, me));
  // Si el responsable está en sesión pero la lista aún no lo trae, se muestra igual.
  if (isOwner && me && !rows.some((r) => r.role === "owner")) {
    rows.unshift(toRow({ userId: me.id, role: "OWNER" }, me));
  }
  rows.sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));
  const onlyOwner = isOwner && rows.every((r) => r.role === "owner");

  const handleRemove = async () => {
    const userId = confirmingUser.id;
    setRemovingId(userId);
    setRemoveError(null);
    const err = await removeMember(home.idHome, userId);
    setRemovingId(null);
    setConfirmingUser(null);
    if (err) setRemoveError(err);
  };

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("header.title")}</h2>
        <p className={styles.sectionSub}>
          {t("header.membersCount", { count: rows.length })}
        </p>
      </div>

      {loading && (
        <p className={styles.state} role="status">
          {t("state.loading")}
        </p>
      )}

      {error && <ErrorState error={error} onRetry={reload} />}

      {!loading && !error && (
        <div className={styles.cardMembers}>
          <Card>
            <div className={styles.listBlock}>
              <p className={styles.blockTitle}>{t("members.title")}</p>
              <div className={styles.userList}>
                {rows.map((user, i) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    index={i}
                    isOwner={isOwner}
                    onRemove={setConfirmingUser}
                    removing={removingId === user.id}
                    t={t}
                  />
                ))}
              </div>
              {onlyOwner && (
                <div className={styles.state} role="status">
                  <p>{t("members.onlyOwnerTitle")}</p>
                  <p>{t("members.onlyOwnerDescription")}</p>
                </div>
              )}
              {removeError && (
                <p className={styles.inviteError} role="alert">
                  {errorMessage(t, removeError, "memberRemove")}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {confirmingUser && (
        <ConfirmModal
          title={t("confirmRemove.title")}
          message={t("confirmRemove.message", { name: fullName(confirmingUser) })}
          confirmLabel={
            removingId ? t("confirmRemove.removing") : t("confirmRemove.confirm")
          }
          cancelLabel={t("confirmRemove.cancel")}
          onConfirm={handleRemove}
          onCancel={() => setConfirmingUser(null)}
          disabled={Boolean(removingId)}
        />
      )}
    </div>
  );
};

export default Users;
