import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight } from "lucide-react";

import Header from "../../design/components/Header/Header";
import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import ErrorState from "../../components/shared/ErrorState/ErrorState";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import { errorMessage } from "../../services/http/errorMessages";
import { useCurrentPerson } from "../../services/auth/useCurrentPerson";
import { usePermissions } from "../../services/auth/usePermissions";
import * as adminApi from "../../services/admin/adminApi";
import { PERMISSIONS } from "../../services/admin/adminApi";
import styles from "./AdminUsers.module.css";

const PAGE_SIZE = 20;
const STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"];
const ADMIN_ROLE = "ADMIN";

/**
 * Directorio de usuarios para administradores (rol global ADMIN).
 * - GET /admin/users con búsqueda y paginación (USER.READ)
 * - Cambio de estado de la cuenta (USER.MANAGE), con confirmación al dejar ACTIVE
 * - Dar o quitar el rol ADMIN (ROLE.MANAGE), con confirmación al quitarlo
 * Cada acción se oculta sin su permiso, y la propia cuenta no se puede modificar;
 * el backend aplica las mismas reglas y responde 403/409 de todos modos.
 */
const AdminUsers = () => {
  const { t } = useTranslation("admin");
  const me = useCurrentPerson();
  const { has } = usePermissions();
  const canManageStatus = has(PERMISSIONS.USER_MANAGE);
  const canManageRoles = has(PERMISSIONS.ROLE_MANAGE);

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [pending, setPending] = useState(null); // acción a confirmar
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await adminApi.listUsers({ q: search, page, size: PAGE_SIZE }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos estándar
    load();
  }, [load]);

  // Al vaciar el campo (borrando o con la × del buscador) vuelve el listado completo,
  // sin tener que pulsar "Buscar" ni recargar la página.
  const changeQuery = (value) => {
    setQuery(value);
    if (!value.trim() && search) {
      setPage(0);
      setSearch("");
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(query);
  };

  const run = async (action) => {
    setBusy(true);
    setActionError(null);
    try {
      await action();
      await load();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const changeStatus = (user, status) => {
    if (status === user.status) return;
    if (status === "ACTIVE") {
      run(() => adminApi.changeUserStatus(user.idUser, status));
      return;
    }
    setPending({ kind: "status", user, status });
  };

  const toggleAdmin = (user) => {
    if (user.roles.includes(ADMIN_ROLE)) {
      setPending({ kind: "revoke", user });
      return;
    }
    run(() => adminApi.grantRole(user.idUser, ADMIN_ROLE));
  };

  const confirmPending = () => {
    const { kind, user, status } = pending;
    run(() =>
      kind === "status"
        ? adminApi.changeUserStatus(user.idUser, status)
        : adminApi.revokeRole(user.idUser, ADMIN_ROLE),
    );
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.totalItems / PAGE_SIZE)) : 1;
  const fullName = (u) => [u.name, u.lastName].filter(Boolean).join(" ");
  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : t("table.never"));

  return (
    <div className={styles.content}>
      <Header
        breadcrumbItems={[
          { label: t("breadcrumb.home"), path: "/dashboard" },
          { label: t("breadcrumb.current") },
        ]}
      />

      <div className={styles.hero}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <div className={styles.body}>
        <form className={styles.search} onSubmit={submitSearch} role="search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.label")}
            maxLength={100}
          />
          <Button type="submit" variant="primary" size="small">
            {t("search.submit")}
          </Button>
        </form>

        {actionError && (
          <p className={styles.alert} role="alert">
            {errorMessage(t, actionError, "adminAction")}
          </p>
        )}

        <Card>
          {error ? (
            <ErrorState error={error} onRetry={load} />
          ) : loading && !data ? (
            <p className={styles.muted} role="status">{t("loading")}</p>
          ) : data.items.length === 0 ? (
            <p className={styles.muted}>{t("empty")}</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">{t("table.user")}</th>
                    <th scope="col">{t("table.status")}</th>
                    <th scope="col">{t("table.roles")}</th>
                    <th scope="col">{t("table.registered")}</th>
                    <th scope="col">{t("table.lastLogin")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((user) => {
                    const isSelf = user.idUser === me?.id;
                    const isAdmin = user.roles.includes(ADMIN_ROLE);
                    const label = fullName(user) || user.email;
                    return (
                      <tr key={user.idUser}>
                        <td>
                          <span className={styles.name}>
                            {fullName(user) || "—"}
                            {isSelf && <span className={styles.you}>{t("table.you")}</span>}
                          </span>
                          <span className={styles.email}>{user.email}</span>
                        </td>
                        <td>
                          {canManageStatus && !isSelf ? (
                            <select
                              className={styles.select}
                              value={user.status}
                              disabled={busy}
                              onChange={(e) => changeStatus(user, e.target.value)}
                              aria-label={t("actions.status", { name: label })}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {t(`status.${s}`)}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`${styles.badge} ${styles[user.status]}`}>
                              {t(`status.${user.status}`)}
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={styles.roles}>
                            {user.roles.length === 0 ? (
                              <span className={styles.muted}>{t("table.noRoles")}</span>
                            ) : (
                              user.roles.map((r) => (
                                <span key={r} className={styles.role}>{r}</span>
                              ))
                            )}
                            {canManageRoles && !isSelf && (
                              <button
                                type="button"
                                className={styles.roleBtn}
                                disabled={busy}
                                onClick={() => toggleAdmin(user)}
                                aria-label={t(isAdmin ? "actions.revokeAdmin" : "actions.grantAdmin", { name: label })}
                                title={t(isAdmin ? "actions.revokeAdmin" : "actions.grantAdmin", { name: label })}
                              >
                                {isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(user.registeredAt)}</td>
                        <td>{formatDate(user.lastLoginAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {data && data.totalItems > PAGE_SIZE && (
          <nav className={styles.pager} aria-label={t("pager.label")}>
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0 || loading}
              aria-label={t("pager.previous")}
            >
              <ChevronLeft size={16} />
            </button>
            <span>{t("pager.position", { page: page + 1, total: totalPages })}</span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page + 1 >= totalPages || loading}
              aria-label={t("pager.next")}
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>

      {pending && (
        <ConfirmModal
          title={t(pending.kind === "status" ? "confirmStatus.title" : "confirmRevoke.title")}
          message={
            pending.kind === "status"
              ? t("confirmStatus.message", {
                  email: pending.user.email,
                  status: t(`status.${pending.status}`),
                })
              : t("confirmRevoke.message", { email: pending.user.email })
          }
          confirmLabel={t("confirm.accept")}
          cancelLabel={t("confirm.cancel")}
          onConfirm={confirmPending}
          onCancel={() => setPending(null)}
          disabled={busy}
        />
      )}
    </div>
  );
};

export default AdminUsers;
