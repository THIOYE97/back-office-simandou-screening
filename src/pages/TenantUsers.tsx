// src/pages/TenantUsers.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, del } from "../api";

type UserItem = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  status: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  roles: string[];
};

type Resp = { items: UserItem[]; limit: number; offset: number; total: number };

const Modal: React.FC<{
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}> = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        className="card cardPad"
        style={{ width: "100%", maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>{title}</h3>
          <button className="btn btnGhost btnSm" onClick={onClose}>✕</button>
        </div>
        <div className="hr" />
        <div>{children}</div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ txt: string; tone?: "ok" | "warn" | "bad" | "neutral" }> = ({ txt, tone = "neutral" }) => {
  const cls =
    tone === "ok" ? "pill pillOk" : tone === "warn" ? "pill pillWarn" : tone === "bad" ? "pill pillBad" : "pill";
  return <span className={cls}>{txt}</span>;
};

const TenantUsers: React.FC = () => {
  const nav = useNavigate();
  const activeTenant = useMemo(() => localStorage.getItem("active_tenant_id") || "", []);

  const [items, setItems] = useState<UserItem[]>([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState<string>(""); // "", "true", "false"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newPassword, setNewPassword] = useState("");

  // confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);

  const params = useMemo(() => {
    const p: any = { limit, offset };
    if (q) p.q = q;
    if (isActive === "true") p.is_active = true;
    if (isActive === "false") p.is_active = false;
    return p;
  }, [limit, offset, q, isActive]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<Resp>("/admin/users", params);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const askConfirm = (title: string, text: string, action: () => Promise<void>) => {
    setConfirmTitle(title);
    setConfirmText(text);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const enable = async (id: string) => {
    await post(`/admin/users/${id}/enable`);
    await load();
  };

  const disable = async (id: string) => {
    await post(`/admin/users/${id}/disable`);
    await load();
  };

  const removeUser = async (id: string) => {
    await del(`/admin/users/${id}`);
    await load();
  };

  const addRole = async (id: string, role: string) => {
    await post(`/admin/users/${id}/roles/add`, { role });
    await load();
  };

  const removeRole = async (id: string, role: string) => {
    await post(`/admin/users/${id}/roles/remove`, { role });
    await load();
  };

  const createUser = async () => {
    setLoading(true);
    setError("");
    try {
      await post("/admin/users", {
        email: newEmail.trim().toLowerCase(),
        full_name: newFullName.trim(),
        is_active: newIsActive,
        password: newPassword,
      });
      setCreateOpen(false);
      setNewEmail("");
      setNewFullName("");
      setNewIsActive(true);
      setNewPassword("");
      setOffset(0);
      await load();
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="pageTitle">
        <div>
          <div className="badge" style={{ marginBottom: 10 }}>
            <span className="strong">Users</span>
            <span className="small">• scope</span>
            {activeTenant ? <span className="mono small">{activeTenant}</span> : <span className="small">(all tenants)</span>}
          </div>

          <h1 className="h1">Tenant Users</h1>
          <p className="sub">
            Gestion complète : activer/désactiver, supprimer, créer, gérer les rôles.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btnGhost btnSm" onClick={() => nav("/tenants")}>← Retour</button>
          <button className="btn btnGhost btnSm" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Rafraîchir"}
          </button>
          <button className="btn btnPrimary btnSm" onClick={() => setCreateOpen(true)}>
            + Créer
          </button>
        </div>
      </div>

      <div className="card cardPad">
        <div className="row" style={{ alignItems: "end" }}>
          <div className="field" style={{ flex: "2 1 280px" }}>
            <div className="label">Recherche</div>
            <input
              className="input"
              value={q}
              onChange={(e) => {
                setOffset(0);
                setQ(e.target.value);
              }}
              placeholder="email ou nom"
            />
          </div>

          <div className="field" style={{ flex: "1 1 160px" }}>
            <div className="label">Actif</div>
            <select
              className="select"
              value={isActive}
              onChange={(e) => {
                setOffset(0);
                setIsActive(e.target.value);
              }}
            >
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </div>

          <div className="field" style={{ flex: "0 0 120px" }}>
            <div className="label">Limit</div>
            <input
              className="input"
              type="number"
              value={limit}
              onChange={(e) => {
                setOffset(0);
                setLimit(Math.max(1, Number(e.target.value)));
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn btnGhost btnSm"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0 || loading}
            >
              Prev
            </button>
            <button
              className="btn btnGhost btnSm"
              onClick={() => setOffset(offset + limit)}
              disabled={loading || offset + limit >= total}
            >
              Next
            </button>
            <div className="small">
              {offset}–{Math.min(offset + limit, total)} / {total}
            </div>
          </div>
        </div>

        {error ? (
          <div className="alert" style={{ marginTop: 12, borderColor: "rgba(255,77,109,.45)", background: "rgba(255,77,109,.12)" }}>
            <div className="strong">Erreur</div>
            <div className="hr" />
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{error}</pre>
          </div>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Tenant</th>
                <th>Rôles</th>
                <th>Status</th>
                <th style={{ width: 260 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((u) => {
                const isSuper = (u.roles || []).includes("SUPER_ADMIN");
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="strong">{u.email}</div>
                      <div className="small">{u.full_name}</div>
                      <div className="mono small">{u.id}</div>
                    </td>

                    <td className="mono small">{u.tenant_id}</td>

                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {(u.roles || []).map((r) => (
                          <Pill key={r} txt={r} tone={r === "SUPER_ADMIN" ? "warn" : "neutral"} />
                        ))}
                        {!u.roles?.length ? <Pill txt="(no roles)" /> : null}
                      </div>

                      <div className="row" style={{ gap: 8 }}>
                        {["USER", "ANALYST", "ADMIN", "OWNER", "SUPER_ADMIN"].map((r) =>
                          (u.roles || []).includes(r) ? (
                            <button
                              key={`rm-${r}`}
                              className="btn btnGhost btnSm"
                              onClick={() =>
                                askConfirm(
                                  "Retirer rôle",
                                  `Retirer le rôle ${r} à ${u.email} ?`,
                                  async () => removeRole(u.id, r)
                                )
                              }
                            >
                              − {r}
                            </button>
                          ) : (
                            <button
                              key={`add-${r}`}
                              className="btn btnGhost btnSm"
                              onClick={() =>
                                askConfirm(
                                  "Ajouter rôle",
                                  `Ajouter le rôle ${r} à ${u.email} ?`,
                                  async () => addRole(u.id, r)
                                )
                              }
                            >
                              + {r}
                            </button>
                          )
                        )}
                      </div>
                      {isSuper ? <div className="small" style={{ marginTop: 8 }}>⚠️ Super admin</div> : null}
                    </td>

                    <td>
                      {u.is_active ? <Pill txt="ACTIVE" tone="ok" /> : <Pill txt="DISABLED" tone="bad" />}
                      <div className="small">{u.status}</div>
                    </td>

                    <td>
                      <div className="row" style={{ gap: 8 }}>
                        {u.is_active ? (
                          <button
                            className="btn btnGhost btnSm"
                            onClick={() => askConfirm("Désactiver user", `Désactiver ${u.email} ?`, async () => disable(u.id))}
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            className="btn btnGhost btnSm"
                            onClick={() => askConfirm("Activer user", `Activer ${u.email} ?`, async () => enable(u.id))}
                          >
                            Enable
                          </button>
                        )}

                        <button
                          className="btn btnDanger btnSm"
                          onClick={() =>
                            askConfirm("Supprimer user", `Supprimer définitivement ${u.email} ?`, async () => removeUser(u.id))
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="small" style={{ padding: 18 }}>
                    Aucun user trouvé.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} title="Créer un user" onClose={() => setCreateOpen(false)}>
        <div style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@domain.com" />
          </div>

          <div className="field">
            <div className="label">Full name</div>
            <input className="input" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} placeholder="Full name" />
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={newIsActive} onChange={(e) => setNewIsActive(e.target.checked)} />
            <span className="muted">Actif</span>
          </label>

          <div className="field">
            <div className="label">Password (min 8)</div>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btnGhost" onClick={() => setCreateOpen(false)}>Annuler</button>
            <button className="btn btnPrimary" onClick={createUser} disabled={!newEmail || !newFullName || newPassword.length < 8 || loading}>
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal open={confirmOpen} title={confirmTitle} onClose={() => setConfirmOpen(false)}>
        <p className="muted" style={{ marginTop: 0 }}>{confirmText}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btnGhost" onClick={() => setConfirmOpen(false)}>Annuler</button>
          <button
            className="btn btnPrimary"
            onClick={async () => {
              try {
                setConfirmOpen(false);
                if (confirmAction) await confirmAction();
              } catch (e: any) {
                setError(e?.message || "Error");
              }
            }}
          >
            Confirmer
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TenantUsers;

