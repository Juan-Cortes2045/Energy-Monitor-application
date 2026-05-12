import { useState } from "react";
import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import Input from "../../../design/components/Input/Input";
import styles from "./Users.module.css";

const mockUsers = [
  {
    id: 1,
    name: "Carlos García",
    email: "carlos.garcia@email.com",
    role: "owner",
  },
  { id: 2, name: "Ana Martínez", email: "ana.m@email.com", role: "member" },
  { id: 3, name: "Luis Pérez", email: "luis.perez@email.com", role: "member" },
  {
    id: 4,
    name: "Sofía Ramos",
    email: "sofia.ramos@empresa.co",
    role: "member",
  },
];

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

const UserRow = ({ user, index, isOwner, onRemove }) => (
  <div className={styles.userRow}>
    <Avatar name={user.name} index={index} />
    <div className={styles.userInfo}>
      <p className={styles.userName}>{user.name}</p>
      <p className={styles.userEmail}>{user.email}</p>
    </div>
    <span
      className={`${styles.badge} ${user.role === "owner" ? styles.badgeOwner : styles.badgeMember}`}
    >
      {user.role === "owner" ? "Responsable" : "Miembro"}
    </span>
    {isOwner && user.role !== "owner" && (
      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(user.id)}
        aria-label={`Eliminar a ${user.name}`}
      >
        ×
      </button>
    )}
  </div>
);

const Users = ({ project, isOwner = false }) => {
  const [users, setUsers] = useState(mockUsers);
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  const handleInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return setInviteError("Ingresa un correo electrónico.");
    if (!emailRegex.test(email))
      return setInviteError("Correo electrónico inválido.");
    if (users.some((u) => u.email === email))
      return setInviteError("Este usuario ya es miembro.");
    if (pending.some((p) => p.email === email))
      return setInviteError("Ya se envió una invitación a este correo.");

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
      {/* ── Cabecera — ocupa las 2 columnas (grid-area: header) ── */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Usuarios</h2>
        <p className={styles.sectionSub}>
          {users.length} {users.length === 1 ? "miembro" : "miembros"} en este
          proyecto
        </p>
      </div>

      {/* ── Miembros — columna izquierda (grid-area: members) ── */}
      <div className={styles.cardMembers}>
        <Card>
          <div className={styles.listBlock}>
            <p className={styles.blockTitle}>Miembros del proyecto</p>
            <div className={styles.userList}>
              {users.map((user, i) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={i}
                  isOwner={isOwner}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Invitar — columna derecha (grid-area: invite) ── */}
      {isOwner && (
        <div className={styles.cardInvite}>
          <Card>
            <div className={styles.inviteBlock}>
              <p className={styles.blockTitle}>Invitar usuario por correo</p>
              <div className={styles.inviteRow}>
                <div className={styles.inviteInputWrap}>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    placeholder="correo@ejemplo.com"
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  />
                </div>
                <Button variant="primary" onClick={handleInvite}>
                  Invitar
                </Button>
              </div>
              {inviteError && (
                <p className={styles.inviteError}>{inviteError}</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── Pendientes — columna derecha debajo de invitar (grid-area: pending) ── */}
      {isOwner && (
        <div className={styles.cardPending}>
          <Card>
            <div className={styles.listBlock}>
              <p className={styles.blockTitle}>Invitaciones pendientes</p>
              {pending.length === 0 ? (
                <div className={styles.emptyPending}>
                  Sin invitaciones pendientes
                </div>
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
                          Invitación enviada
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleCancelInvite(p.id)}
                      >
                        Cancelar
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
