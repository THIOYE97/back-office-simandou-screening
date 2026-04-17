// src/pages/TenantUsers.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  RefreshCw,
  Shield,
  User,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
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
        style={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 18,
          border: "1px solid var(--border, rgba(255,255,255,0.08))",
          background: "var(--bg-card, #141518)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "var(--text-primary, #F3F4F6)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h3>

          <button
            className="btn btnGhost btnSm"
            onClick={onClose}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <X size={14} strokeWidth={2.2} />
            Fermer
          </button>
        </div>

        <div
          style={{
            height: 1,
            background: "var(--border, rgba(255,255,255,0.08))",
            marginBottom: 14,
          }}
        />

        <div>{children}</div>
      </div>
    </div>
  );
};

const Pill: React.FC<{
  txt: string;
  tone?: "ok" | "warn" | "bad" | "neutral";
}> = ({ txt, tone = "neutral" }) => {
  const palette =
    tone === "ok"
      ? {
          color: "#2ECC8F",
          bg: "rgba(46,204,143,0.12)",
          border: "rgba(46,204,143,0.22)",
        }
      : tone === "warn"
      ? {
          color: "#F5920A",
          bg: "rgba(245,146,10,0.12)",
          border: "rgba(245,146,10,0.22)",
        }
      : tone === "bad"
      ? {
          color: "#E84040",
          bg: "rgba(232,64,64,0.12)",
          border: "rgba(232,64,64,0.22)",
        }
      : {
          color: "var(--text-secondary, rgba(243,244,246,0.72))",
          bg: "rgba(255,255,255,0.05)",
          border: "var(--border, rgba(255,255,255,0.08))",
        };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
        color: palette.color,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
      }}
    >
      {txt}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  tone?: "default" | "ok" | "bad";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}> = ({ title, value, tone = "default", icon: Icon }) => {
  const toneMap =
    tone === "ok"
      ? { color: "#2ECC8F", bg: "rgba(46,204,143,0.12)" }
      : tone === "bad"
      ? { color: "#E84040", bg: "rgba(232,64,64,0.12)" }
      : { color: "var(--text-accent, #5BA8F5)", bg: "rgba(45,127,214,0.12)" };

  return (
    <div
      className="card cardPad"
      style={{
        borderRadius: 16,
        border: "1px solid var(--border, rgba(255,255,255,0.08))",
        background: "var(--bg-card, #141518)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: toneMap.bg,
          color: toneMap.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon size={18} strokeWidth={2.1} />
      </div>

      <div
        style={{
          fontSize: 12.5,
          color: "var(--text-secondary, rgba(243,244,246,0.72))",
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: "var(--text-primary, #F3F4F6)",
        }}
      >
        {value}
      </div>
    </div>
  );
};

const TenantUsers: React.FC = () => {
  const nav = useNavigate();
  const activeTenant = useMemo(() => localStorage.getItem("active_tenant_id") || "", []);

  const [items, setItems] = useState<UserItem[]>([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [q, setQ] = useState("");
  const [isActive, setIsActive] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newPassword, setNewPassword] = useState("");

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

  const stats = useMemo(() => {
    const active = items.filter((u) => u.is_active).length;
    const inactive = items.filter((u) => !u.is_active).length;
    const superAdmins = items.filter((u) => (u.roles || []).includes("SUPER_ADMIN")).length;
    return {
      total: items.length,
      active,
      inactive,
      superAdmins,
    };
  }, [items]);

  return (
    <div className="page">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header */}
        <div
          className="card cardPad"
          style={{
            borderRadius: 18,
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            background: "var(--bg-card, #141518)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(45,127,214,0.10)",
                  border: "1px solid rgba(45,127,214,0.18)",
                  marginBottom: 14,
                }}
              >
                <Users size={14} strokeWidth={2.1} color="var(--text-accent, #5BA8F5)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary, #F3F4F6)" }}>
                  Users
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 6px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    color: "var(--text-accent, #5BA8F5)",
                  }}
                >
                  {activeTenant || "all tenants"}
                </span>
              </div>

              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary, #F3F4F6)",
                  margin: 0,
                }}
              >
                Tenant Users
              </h1>

              <p
                style={{
                  marginTop: 8,
                  fontSize: 13.5,
                  color: "var(--text-secondary, rgba(243,244,246,0.72))",
                }}
              >
                Gestion complète des utilisateurs : création, activation, suppression et gestion des rôles.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="btn btnGhost btnSm"
                onClick={() => nav("/tenants")}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <ArrowLeft size={14} strokeWidth={2.2} />
                Retour
              </button>

              <button
                className="btn btnGhost btnSm"
                onClick={load}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <RefreshCw size={14} strokeWidth={2.2} />
                {loading ? "Loading…" : "Rafraîchir"}
              </button>

              <button
                className="btn btnPrimary btnSm"
                onClick={() => setCreateOpen(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Plus size={14} strokeWidth={2.2} />
                Créer
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <StatCard title="Utilisateurs visibles" value={stats.total} icon={Users} />
          <StatCard title="Actifs" value={stats.active} tone="ok" icon={UserPlus} />
          <StatCard title="Inactifs" value={stats.inactive} tone="bad" icon={UserMinus} />
          <StatCard title="Super admins" value={stats.superAdmins} icon={Shield} />
        </div>

        {/* Filters */}
        <div
          className="card cardPad"
          style={{
            borderRadius: 18,
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            background: "var(--bg-card, #141518)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 120px auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Recherche</div>
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

            <div>
              <div className="label" style={{ marginBottom: 6 }}>Actif</div>
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

            <div>
              <div className="label" style={{ marginBottom: 6 }}>Limit</div>
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

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="btn btnGhost btnSm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0 || loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <ChevronLeft size={14} strokeWidth={2.2} />
                Prev
              </button>

              <button
                className="btn btnGhost btnSm"
                onClick={() => setOffset(offset + limit)}
                disabled={loading || offset + limit >= total}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                Next
                <ChevronRight size={14} strokeWidth={2.2} />
              </button>

              <div className="small">
                {offset}–{Math.min(offset + limit, total)} / {total}
              </div>
            </div>
          </div>

          {error ? (
            <div
              style={{
                marginTop: 14,
                border: "1px solid rgba(255,77,109,.35)",
                background: "rgba(255,77,109,.10)",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ff6b81",
                  marginBottom: 8,
                }}
              >
                <AlertTriangle size={16} strokeWidth={2.2} />
                Erreur
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 12.5 }}>{error}</pre>
            </div>
          ) : null}
        </div>

        {/* Table */}
        <div
          className="card"
          style={{
            borderRadius: 18,
            border: "1px solid var(--border, rgba(255,255,255,0.08))",
            background: "var(--bg-card, #141518)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid var(--border, rgba(255,255,255,0.08))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary, #F3F4F6)",
              }}
            >
              Résultats utilisateurs
            </div>

            <div className="small mono">
              limit={limit} · offset={offset} · total={total}
            </div>
          </div>

          <div className="tableWrap" style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Tenant</th>
                  <th>Rôles</th>
                  <th>Status</th>
                  <th style={{ width: 300 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((u) => {
                  const isSuper = (u.roles || []).includes("SUPER_ADMIN");

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              background: "rgba(45,127,214,0.12)",
                              border: "1px solid rgba(45,127,214,0.18)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--text-accent, #5BA8F5)",
                              flexShrink: 0,
                            }}
                          >
                            <User size={16} strokeWidth={2.1} />
                          </div>

                          <div>
                            <div style={{ fontWeight: 700 }}>{u.email}</div>
                            <div className="small">{u.full_name}</div>
                            <div className="mono small">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="mono small">{u.tenant_id}</td>

                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                          {(u.roles || []).map((r) => (
                            <Pill key={r} txt={r} tone={r === "SUPER_ADMIN" ? "warn" : "neutral"} />
                          ))}
                          {!u.roles?.length ? <Pill txt="(no roles)" /> : null}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
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
                                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                              >
                                <UserMinus size={13} strokeWidth={2.2} />
                                {r}
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
                                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                              >
                                <UserPlus size={13} strokeWidth={2.2} />
                                {r}
                              </button>
                            )
                          )}
                        </div>

                        {isSuper ? (
                          <div
                            className="small"
                            style={{
                              marginTop: 8,
                              color: "#F5920A",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <AlertTriangle size={13} strokeWidth={2.2} />
                            Super admin
                          </div>
                        ) : null}
                      </td>

                      <td>
                        {u.is_active ? <Pill txt="ACTIVE" tone="ok" /> : <Pill txt="DISABLED" tone="bad" />}
                        <div className="small" style={{ marginTop: 6 }}>{u.status}</div>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {u.is_active ? (
                            <button
                              className="btn btnGhost btnSm"
                              onClick={() =>
                                askConfirm("Désactiver user", `Désactiver ${u.email} ?`, async () => disable(u.id))
                              }
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              className="btn btnGhost btnSm"
                              onClick={() =>
                                askConfirm("Activer user", `Activer ${u.email} ?`, async () => enable(u.id))
                              }
                            >
                              Enable
                            </button>
                          )}

                          <button
                            className="btn btnGhost btnSm"
                            style={{
                              borderColor: "rgba(245,146,10,0.24)",
                              color: "#F5920A",
                            }}
                            onClick={() =>
                              askConfirm(
                                "Mettre à jour les rôles",
                                `Confirmer la gestion avancée des rôles pour ${u.email} ?`,
                                async () => Promise.resolve()
                              )
                            }
                          >
                            <UserCog size={14} strokeWidth={2.2} />
                            Rôles
                          </button>

                          <button
                            className="btn btnDanger btnSm"
                            onClick={() =>
                              askConfirm(
                                "Supprimer user",
                                `Supprimer définitivement ${u.email} ?`,
                                async () => removeUser(u.id)
                              )
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
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} title="Créer un user" onClose={() => setCreateOpen(false)}>
        <div style={{ display: "grid", gap: 12 }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Email</div>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted, rgba(243,244,246,0.45))",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <Mail size={15} strokeWidth={2.1} />
              </span>
              <input
                className="input"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@domain.com"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div>
            <div className="label" style={{ marginBottom: 6 }}>Full name</div>
            <input
              className="input"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="Full name"
            />
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={newIsActive}
              onChange={(e) => setNewIsActive(e.target.checked)}
            />
            <span className="small">Actif</span>
          </label>

          <div>
            <div className="label" style={{ marginBottom: 6 }}>Password (min 8)</div>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btnGhost" onClick={() => setCreateOpen(false)}>
              Annuler
            </button>
            <button
              className="btn btnPrimary"
              onClick={createUser}
              disabled={!newEmail || !newFullName || newPassword.length < 8 || loading}
            >
              Créer
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal open={confirmOpen} title={confirmTitle} onClose={() => setConfirmOpen(false)}>
        <p className="small" style={{ marginTop: 0, marginBottom: 14 }}>
          {confirmText}
        </p>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn btnGhost" onClick={() => setConfirmOpen(false)}>
            Annuler
          </button>
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