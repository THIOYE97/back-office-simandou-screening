// src/pages/Tenants.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  KeyRound,
  Mail,
  Plus,
  RefreshCw,
  Shield,
  Users,
  ArrowRight,
} from "lucide-react";
import {
  adminCreateInvitation,
  adminCreateTenant,
  adminListTenants,
} from "../api/admin";
import type { TenantRow } from "../api/admin";

export default function Tenants() {
  const [items, setItems] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ANALYST");
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");

  const [inviteToken, setInviteToken] = useState<string | null>(null);

  const nav = useNavigate();

  const selectedTenant = useMemo(
    () => items.find((t) => t.id === selectedTenantId) || null,
    [items, selectedTenantId]
  );

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await adminListTenants();
      setItems(data);

      if (!selectedTenantId && data[0]?.id) setSelectedTenantId(data[0].id);
      if (selectedTenantId && !data.some((t) => t.id === selectedTenantId)) {
        setSelectedTenantId(data[0]?.id || "");
      }
    } catch (e: any) {
      setError(e?.message || "Impossible de charger les tenants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onCreateTenant() {
    setInviteToken(null);
    setError("");

    const n = name.trim();
    const s = slug.trim().toLowerCase();

    if (!n || !s) return alert("name + slug requis");
    if (!/^[a-z0-9_-]+$/.test(s)) return alert("Slug invalide (a-z, 0-9, _ , -)");

    setLoading(true);
    try {
      await adminCreateTenant({ name: n, slug: s });
      setName("");
      setSlug("");
      await refresh();
    } catch (e: any) {
      setError(e?.message || "Erreur création tenant.");
    } finally {
      setLoading(false);
    }
  }

  async function onInvite() {
    setInviteToken(null);
    setError("");

    if (!selectedTenantId) return alert("Choisir un tenant");

    const email = inviteEmail.trim().toLowerCase();
    if (!email.includes("@")) return alert("Email invalide");

    setLoading(true);
    try {
      const resp = await adminCreateInvitation(selectedTenantId, {
        email,
        role: inviteRole,
      });
      setInviteToken(resp.token);
      setInviteEmail("");
    } catch (e: any) {
      setError(e?.message || "Erreur création invitation.");
    } finally {
      setLoading(false);
    }
  }

  function statusTone(status?: string) {
    if (status === "ACTIVE") {
      return {
        color: "#2ECC8F",
        bg: "rgba(46,204,143,0.12)",
        border: "rgba(46,204,143,0.24)",
      };
    }
    if (status === "SUSPENDED") {
      return {
        color: "#E84040",
        bg: "rgba(232,64,64,0.12)",
        border: "rgba(232,64,64,0.24)",
      };
    }
    return {
      color: "#F5920A",
      bg: "rgba(245,146,10,0.12)",
      border: "rgba(245,146,10,0.24)",
    };
  }

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
                <Building2 size={14} strokeWidth={2.1} color="var(--text-accent, #5BA8F5)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary, #F3F4F6)" }}>
                  Tenants
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
                Tenant Management
              </h1>

              <p
                style={{
                  marginTop: 8,
                  fontSize: 13.5,
                  color: "var(--text-secondary, rgba(243,244,246,0.72))",
                }}
              >
                Création de tenants, invitations utilisateurs et accès rapide aux espaces administrés.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border, rgba(255,255,255,0.08))",
                  fontSize: 12,
                  color: "var(--text-secondary, rgba(243,244,246,0.72))",
                }}
              >
                {loading ? "sync…" : `${items.length} tenants`}
              </span>

              <button
                className="btn btnGhost btnSm"
                onClick={refresh}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <RefreshCw size={14} strokeWidth={2.2} />
                {loading ? "Loading…" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div
            style={{
              border: "1px solid rgba(255,77,109,.35)",
              background: "rgba(255,77,109,.10)",
              borderRadius: 14,
              padding: 14,
              color: "#ff6b81",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : null}

        {/* Forms */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Create tenant */}
          <div
            className="card cardPad"
            style={{
              borderRadius: 18,
              border: "1px solid var(--border, rgba(255,255,255,0.08))",
              background: "var(--bg-card, #141518)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "rgba(45,127,214,0.12)",
                  color: "var(--text-accent, #5BA8F5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={18} strokeWidth={2.1} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary, #F3F4F6)",
                  }}
                >
                  Créer un tenant
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-secondary, rgba(243,244,246,0.72))",
                  }}
                >
                  Ajoute un nouvel espace de travail administrable.
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Name</div>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ADC"
                />
              </div>

              <div>
                <div className="label" style={{ marginBottom: 6 }}>Slug</div>
                <input
                  className="input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="adc"
                />
                <div className="small" style={{ marginTop: 6 }}>
                  Format: <span className="mono">a-z 0-9 _ -</span>
                </div>
              </div>

              <button
                className="btn btnPrimary"
                onClick={onCreateTenant}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content" }}
              >
                <Plus size={14} strokeWidth={2.2} />
                Créer
              </button>
            </div>
          </div>

          {/* Invite user */}
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
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "rgba(167,139,250,0.14)",
                    color: "#A78BFA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={18} strokeWidth={2.1} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--text-primary, #F3F4F6)",
                    }}
                  >
                    Inviter un utilisateur
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--text-secondary, rgba(243,244,246,0.72))",
                    }}
                  >
                    Génére une invitation liée à un tenant.
                  </div>
                </div>
              </div>

              {selectedTenant ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border, rgba(255,255,255,0.08))",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{selectedTenant.name}</span>
                  <code
                    style={{
                      padding: "2px 6px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-accent, #5BA8F5)",
                    }}
                  >
                    {selectedTenant.slug}
                  </code>
                </span>
              ) : (
                <span
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "rgba(245,146,10,0.12)",
                    border: "1px solid rgba(245,146,10,0.24)",
                    color: "#F5920A",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Aucun tenant sélectionné
                </span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.4fr 1fr auto auto",
                gap: 12,
                alignItems: "end",
              }}
            >
              <div>
                <div className="label" style={{ marginBottom: 6 }}>Tenant</div>
                <select
                  className="select"
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                >
                  {items.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

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
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="email@company.com"
                    style={{ paddingLeft: 38 }}
                  />
                </div>
              </div>

              <div>
                <div className="label" style={{ marginBottom: 6 }}>Role</div>
                <select
                  className="select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="ANALYST">ANALYST</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>

              <button
                className="btn btnPrimary"
                onClick={onInvite}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <KeyRound size={14} strokeWidth={2.2} />
                Créer invitation
              </button>

              {selectedTenantId && (
                <button
                  className="btn btnGhost"
                  onClick={() => {
                    localStorage.setItem("active_tenant_id", selectedTenantId);
                    nav(`/tenants/${selectedTenantId}/users`);
                  }}
                  disabled={loading}
                  style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  Voir users
                  <ArrowRight size={14} strokeWidth={2.2} />
                </button>
              )}
            </div>

            {inviteToken && (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 14,
                  padding: 14,
                  border: "1px solid rgba(46,204,143,0.22)",
                  background: "rgba(46,204,143,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#2ECC8F",
                    marginBottom: 6,
                  }}
                >
                  Token invitation
                </div>
                <div className="small" style={{ marginBottom: 10 }}>
                  Copie-colle ça pour le moment. Plus tard, il sera envoyé par email.
                </div>
                <code
                  className="mono"
                  style={{
                    wordBreak: "break-all",
                    display: "block",
                    fontSize: 12,
                    color: "var(--text-primary, #F3F4F6)",
                  }}
                >
                  {inviteToken}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
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
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary, #F3F4F6)",
                }}
              >
                Liste des tenants
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--text-secondary, rgba(243,244,246,0.72))",
                  marginTop: 4,
                }}
              >
                {items.length} tenant{items.length > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="tableWrap" style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => {
                  const tone = statusTone(t.status);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
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
                            <Building2 size={16} strokeWidth={2.1} />
                          </div>
                          <div style={{ fontWeight: 700 }}>{t.name}</div>
                        </div>
                      </td>

                      <td className="mono">{t.slug}</td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: tone.color,
                            background: tone.bg,
                            border: `1px solid ${tone.border}`,
                          }}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="mono small">{t.created_at || "-"}</td>
                    </tr>
                  );
                })}

                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="small" style={{ padding: 18 }}>
                      Aucun tenant
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}