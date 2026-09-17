import { useState } from "react";
import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import Input from "../../../design/components/Input/Input";
import styles from "./Users.module.css";
import { useTranslation } from "react-i18next";
import { useHomeMembers } from "./useHomeMembers";
import { inviteMember, removeMember } from "../../../services/home.service";
import LoadingState from "../../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";

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

const UserRow = ({ member, index, isOwner, onRemove, t }) => {
  const fullName = `${member.name} ${member.last_name}`.trim();
  const isOwnerRow = member.role === "OWNER";
  return (
    <div className={styles.userRow}>
      <Avatar name={fullName} index={index} />
      <div className={styles.userInfo}>
        <p className={styles.userName}>{fullName}</p>
        <p className={styles.userEmail}>{member.email}</p>
      </div>
      <span
        className={`${styles.badge} ${isOwnerRow ? styles.badgeOwner : styles.badgeMember}`}
      >
        {isOwnerRow ? t("roles.owner") : t("roles.member")}
      </span>
      {isOwner && !isOwnerRow && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => onRemove(member.user_id)}
          aria-label={t("actions.removeUser", { name: fullName })}
        >
          ×
        </button>
      )}
    </div>
  );
};

const Users = ({ home, isOwner = false }) => {
  const { t } = useTranslation("users");
  const { data: members, loading, error, refetch } = useHomeMembers(home.id);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) return setInviteError(t("invite.errors.empty"));
    if (!emailRegex.test(email)) return setInviteError(t("invite.errors.invalid"));

    setInviting(true);
    try {
      await inviteMember(home.id, email);
      setInviteEmail("");
      setInviteError("");
      await refetch();
    } catch (err) {
      setInviteError(
        err.code === "USER_NOT_FOUND"
          ? t("invite.errors.userNotFound")
          : err.code === "ALREADY_MEMBER"
            ? t("invite.errors.alreadyMember")
            : err.message,
      );
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId) => {
    await removeMember(home.id, userId);
    await refetch();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("header.title")}</h2>
        <p className={styles.sectionSub}>
          {t("header.membersCount", { count: members.length })}
        </p>
      </div>

      <div className={styles.cardMembers}>
        <Card>
          <div className={styles.listBlock}>
            <p className={styles.blockTitle}>{t("members.title")}</p>
            <div className={styles.userList}>
              {members.map((member, i) => (
                <UserRow
                  key={member.user_id}
                  member={member}
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
                <Button variant="primary" onClick={handleInvite} disabled={inviting}>
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
    </div>
  );
};

export default Users;
