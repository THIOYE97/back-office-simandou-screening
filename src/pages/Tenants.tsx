// src/pages/Tenants.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

      // auto-select
      if (!selectedTenantId && data[0]?.id) setSelectedTenantId(data[0].id);
      // if currently selected tenant is gone, fallback
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="page">
      <div className="pageTitle">
        <div>
          <h1 className="h1">Tenants</h1>
          <p className="sub">
            Création, invitations, et accès rapide aux users par tenant.
          </p>
        </div>

        <div className="row" style={{ alignItems: "center" }}>
          <span className="kbd">
            {loading ? "sync…" : `${items.length} tenants`}
          </span>

          <button
            className="btn btnGhost btnSm"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="alert alertErr" style={{ marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <div className="row">
        {/* Create tenant */}
        <div className="card cardPad" style={{ flex: "1 1 420px" }}>
          <div className="cardHeader">Créer un tenant</div>

          <div className="row" style={{ alignItems: "end" }}>
            <div className="field" style={{ flex: "1 1 200px" }}>
              <div className="label">Name</div>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ADC"
              />
            </div>

            <div className="field" style={{ flex: "1 1 200px" }}>
              <div className="label">Slug</div>
              <input
                className="input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="adc"
              />
              <div className="small">
                Format: <span className="mono">a-z 0-9 _ -</span>
              </div>
            </div>

            <button
              className="btn btnPrimary"
              onClick={onCreateTenant}
              disabled={loading}
            >
              Créer
            </button>
          </div>
        </div>

        {/* Invite user */}
        <div className="card cardPad" style={{ flex: "1 1 520px" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="cardHeader" style={{ marginBottom: 0 }}>
              Inviter un utilisateur
            </div>
            {selectedTenant ? (
              <span className="pill">
                <span className="strong">{selectedTenant.name}</span>
                <span className="kbd">{selectedTenant.slug}</span>
              </span>
            ) : (
              <span className="pill pillWarn">Aucun tenant sélectionné</span>
            )}
          </div>

          <div className="hr" />

          <div className="row" style={{ alignItems: "end" }}>
            <div className="field" style={{ flex: "1 1 220px" }}>
              <div className="label">Tenant</div>
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

            <div className="field" style={{ flex: "2 1 280px" }}>
              <div className="label">Email</div>
              <input
                className="input"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@company.com"
              />
            </div>

            <div className="field" style={{ flex: "1 1 180px" }}>
              <div className="label">Role</div>
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
            >
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
              >
                Voir users
              </button>
            )}
          </div>

          {inviteToken && (
            <div className="alert" style={{ marginTop: 12 }}>
              <div className="strong">Token invitation</div>
              <div className="small">
                Copie-colle ça pour le moment (plus tard email).
              </div>
              <div className="hr" />
              <code className="mono" style={{ wordBreak: "break-all" }}>
                {inviteToken}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Tenants table */}
      <div style={{ marginTop: 16 }} className="card cardPad">
        <div
          className="row"
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <div className="strong">Liste</div>
          <span className="small">
            {items.length} tenant{items.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="hr" />

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td className="strong">{t.name}</td>
                  <td className="mono">{t.slug}</td>
                  <td>
                    <span
                      className={`pill ${
                        t.status === "ACTIVE"
                          ? "pillOk"
                          : t.status === "SUSPENDED"
                          ? "pillBad"
                          : "pillWarn"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="mono small">{t.created_at || "-"}</td>
                </tr>
              ))}

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
  );
}

