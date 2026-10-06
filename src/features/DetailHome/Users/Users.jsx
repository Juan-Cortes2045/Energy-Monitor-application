import { useState } from "react";
import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import Input from "../../../design/components/Input/Input";
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
  { id: 2, name: "Ana", lastName: "Martínez", email: "ana.m@email.com", role: "member" },
  { id: 3, name: "Luis", lastName: "Pérez", email: "luis.perez@email.com", role: "member" },
  {
    id: 4,
    name: "Sofía",
    lastName: "Ramos",
    email: "sofia.ramos@empresa.co",
    role: "member",
  },
];

// El backend separa `name` y `lastName`; las iniciales se siguen tomando de los
// dos para no perder la que aportaba el apellido dentro del nombre completo.
const getInitials = (name = "", lastName = "") =>
  [name, lastName]
    .map((word) => word.trim().split(" ")[0]?.[0]?.toUpperCase() ?? "")
    .join("");

const fullName = (user) =>
  [user.name, user.lastName].filter(Boolean).join(" ");

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
  const { t } = useTranslation("users");

  const [users, setUsers] = useState(mockUsers);
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const handleInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return setInviteError(t("invite.errors.empty"));
    if (!emailRegex.test(email))
      return setInviteError(t("invite.errors.invalid"));
    if (users.some((u) => u.email === email))
      return setInviteError(t("invite.errors.alreadyMember"));
    if (pending.some((p) => p.email === email))
      return setInviteError(t("invite.errors.alreadyInvited"));

    setPending((prev) => [...prev, { id: Date.now(), email }]);
    setInviteEmail("");
    setInviteError("");
  };

  const handleCancelInvite = (id) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemove = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("header.title")}</h2>
        <p className={styles.sectionSub}>
          {t("header.membersCount", { count: users.length })}
        </p>
      </div>

      <div className={styles.cardMembers}>
        <Card>
          <div className={styles.listBlock}>
            <p className={styles.blockTitle}>{t("members.title")}</p>
            <div className={styles.userList}>
              {users.map((user, i) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={i}
                  isOwner={isOwner}
                  onRemove={handleRemove}
                  t={t}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {isOwner && (
        <div className={styles.cardInvite}>
          <Card>
            <div className={styles.inviteBlock}>
              <p className={styles.blockTitle}>{t("invite.title")}</p>
              <div className={styles.inviteRow}>
                <div className={styles.inviteInputWrap}>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    placeholder={t("invite.placeholder")}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  />
                </div>
                <Button variant="primary" onClick={handleInvite}>
                  {t("invite.button")}
                </Button>
              </div>
              {inviteError && (
                <p className={styles.inviteError}>{inviteError}</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {isOwner && (
        <div className={styles.cardPending}>
          <Card>
            <div className={styles.listBlock}>
              <p className={styles.blockTitle}>{t("pending.title")}</p>
              {pending.length === 0 ? (
                <div className={styles.emptyPending}>{t("pending.empty")}</div>
              ) : (
                <div className={styles.userList}>
                  {pending.map((p) => (
                    <div key={p.id} className={styles.pendingRow}>
                      <div className={`${styles.avatar} ${styles.avatar_gray}`}>
                        ✉
                      </div>
                      <div className={styles.userInfo}>
                        <p className={styles.userEmail}>{p.email}</p>
                        <p className={styles.pendingLabel}>
                          {t("pending.sent")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleCancelInvite(p.id)}
                      >
                        {t("pending.cancel")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Users;
