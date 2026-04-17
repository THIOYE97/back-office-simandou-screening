// src/pages/Screenings.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  User,
} from "lucide-react";
import { get } from "../api";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type ScreeningItem = {
  id: string;
  tenant_id: string;
  created_at: string;
  completed_at: string | null;
  status: string;
  provider: string;
  client_id: string | null;
  case_id: string | null;

  triggered_by: string | null;
  triggered_by_email: string | null;

  screened_name: string | null;

  engine_risk_level: string | null;
  engine_confidence: number | null;
  engine_action: string | null;

  analyst_decision: string | null;
  analyst_comment: string | null;
  analyst_decided_by_email: string | null;
  analyst_decided_by_user_id: string | null;
  analyst_decided_at: string | null;
};

type Resp = { items: ScreeningItem[]; limit: number; offset: number };

const fmt = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
};

const LS_KEY = "active_tenant_id";

const Pill: React.FC<{
  txt?: string | null;
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
      {txt || "-"}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  tone?: "default" | "high" | "medium" | "low";
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}> = ({ title, value, tone = "default", icon: Icon }) => {
  const toneMap =
    tone === "high"
      ? { color: "#E84040", bg: "rgba(232,64,64,0.12)" }
      : tone === "medium"
      ? { color: "#F5920A", bg: "rgba(245,146,10,0.12)" }
      : tone === "low"
      ? { color: "#2ECC8F", bg: "rgba(46,204,143,0.12)" }
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

const Screenings: React.FC = () => {
  const [items, setItems] = useState<ScreeningItem[]>([]);
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const [status, setStatus] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [riskLevel, setRiskLevel] = useState<string>("");

  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [tenantId, setTenantId] = useState<string>(() => localStorage.getItem(LS_KEY) || "");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const params = useMemo(() => {
    const p: any = { limit, offset };
    if (status) p.status = status;
    if (provider) p.provider = provider;
    if (riskLevel) p.risk_level = riskLevel;
    return p;
  }, [limit, offset, status, provider, riskLevel]);

  const loadTenants = async () => {
    try {
      const data = await get<TenantRow[]>("/admin/tenants");
      const list = Array.isArray(data) ? data : [];
      setTenants(list);

      if (!localStorage.getItem(LS_KEY) && list[0]?.id) {
        localStorage.setItem(LS_KEY, list[0].id);
        setTenantId(list[0].id);
      }
    } catch {
      // non bloquant
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<Resp>("/admin/screenings", params);
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    load();
  }, [params]);

  const applyTenant = async (id: string) => {
    if (!id) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, id);

    setTenantId(id);
    setOffset(0);
    await load();
  };

  const stats = useMemo(() => {
    const high = items.filter((s) => s.engine_risk_level === "HIGH").length;
    const medium = items.filter((s) => s.engine_risk_level === "MEDIUM").length;
    const low = items.filter((s) => s.engine_risk_level === "LOW").length;
    return {
      total: items.length,
      high,
      medium,
      low,
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
                <ScanSearch size={14} strokeWidth={2.1} color="var(--text-accent, #5BA8F5)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary, #F3F4F6)" }}>
                  Screenings
                </span>
                {tenantId ? (
                  <code
                    style={{
                      fontSize: 11,
                      padding: "2px 6px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text-accent, #5BA8F5)",
                    }}
                  >
                    tenant {tenantId}
                  </code>
                ) : null}
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
                Screening Monitoring
              </h1>

              <p
                style={{
                  marginTop: 8,
                  fontSize: 13.5,
                  color: "var(--text-secondary, rgba(243,244,246,0.72))",
                }}
              >
                Historique global, statut d’exécution, résultat moteur et décision analyste.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="btn btnGhost btnSm"
                onClick={load}
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <RefreshCw size={14} strokeWidth={2.2} />
                {loading ? "Loading…" : "Rafraîchir"}
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
          <StatCard title="Total visibles" value={stats.total} icon={ScanSearch} />
          <StatCard title="High Risk" value={stats.high} tone="high" icon={ShieldAlert} />
          <StatCard title="Medium Risk" value={stats.medium} tone="medium" icon={ShieldQuestion} />
          <StatCard title="Low Risk" value={stats.low} tone="low" icon={ShieldCheck} />
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
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Filter size={16} strokeWidth={2.1} color="var(--text-accent, #5BA8F5)" />
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text-primary, #F3F4F6)",
              }}
            >
              Filtres
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <div className="label" style={{ marginBottom: 6 }}>Tenant</div>
              <select
                className="select"
                value={tenantId}
                onChange={(e) => applyTenant(e.target.value)}
                title="Change tenant"
              >
                <option value="">Tous / tenant courant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug})
                  </option>
                ))}
              </select>
              <div className="small mono" style={{ marginTop: 6, opacity: 0.8 }}>
                active: {tenantId || "—"}
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>Status</div>
              <input
                className="input"
                value={status}
                onChange={(e) => {
                  setOffset(0);
                  setStatus(e.target.value);
                }}
                placeholder="DONE / RUNNING / FAILED"
              />
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>Provider</div>
              <input
                className="input"
                value={provider}
                onChange={(e) => {
                  setOffset(0);
                  setProvider(e.target.value);
                }}
                placeholder="INTERNAL"
              />
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>Risk</div>
              <input
                className="input"
                value={riskLevel}
                onChange={(e) => {
                  setOffset(0);
                  setRiskLevel(e.target.value);
                }}
                placeholder="LOW / MEDIUM / HIGH"
              />
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
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div className="small">
              Tip: tu peux taper juste une partie, ex: <span className="mono">DON</span>,{" "}
              <span className="mono">INTE</span>, <span className="mono">HIG</span>.
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
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
                disabled={loading}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                Next
                <ChevronRight size={14} strokeWidth={2.2} />
              </button>
              <span className="small mono">offset={offset}</span>
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
              Résultats
            </div>
            <div className="small mono">limit={limit} · offset={offset}</div>
          </div>

          <div className="tableResponsive" style={{ overflowX: "auto" }}>
            <table className="table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>User</th>
                  <th>Nom screené</th>
                  <th>Status</th>
                  <th>Engine</th>
                  <th>Analyst</th>
                  <th>IDs</th>
                </tr>
              </thead>

              <tbody>
                {items.map((s) => {
                  const riskTone =
                    s.engine_risk_level === "HIGH"
                      ? "bad"
                      : s.engine_risk_level === "MEDIUM"
                      ? "warn"
                      : s.engine_risk_level === "LOW"
                      ? "ok"
                      : "neutral";

                  const statusTone =
                    s.status === "DONE"
                      ? "ok"
                      : s.status === "FAILED"
                      ? "bad"
                      : s.status === "RUNNING"
                      ? "warn"
                      : "neutral";

                  return (
                    <tr key={s.id}>
                      <td data-label="Heure">
                        <div style={{ fontWeight: 700 }}>{fmt(s.created_at)}</div>
                        <div className="small">done: {fmt(s.completed_at)}</div>
                      </td>

                      <td data-label="User">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid var(--border, rgba(255,255,255,0.08))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--text-accent, #5BA8F5)",
                              flexShrink: 0,
                            }}
                          >
                            <User size={14} strokeWidth={2.1} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{s.triggered_by_email || "(unknown)"}</div>
                            <div className="mono small">{s.triggered_by || "-"}</div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Nom screené">
                        <div style={{ fontWeight: 700 }}>{s.screened_name || "(no name)"}</div>
                        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Pill txt={s.provider} />
                          <Pill txt={s.client_id || "-"} />
                        </div>
                      </td>

                      <td data-label="Status">
                        <Pill txt={s.status} tone={statusTone as any} />
                      </td>

                      <td data-label="Engine">
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Pill txt={s.engine_risk_level} tone={riskTone as any} />
                          <Pill txt={s.engine_action} />
                        </div>
                        <div className="small" style={{ marginTop: 6 }}>
                          confidence: <span className="mono">{s.engine_confidence ?? "-"}</span>
                        </div>
                      </td>

                      <td data-label="Analyst">
                        <div style={{ fontWeight: 700 }}>{s.analyst_decision || "-"}</div>
                        <div className="small">
                          {s.analyst_decided_by_email || ""}
                          {s.analyst_decided_at ? <span> • {fmt(s.analyst_decided_at)}</span> : null}
                        </div>
                        {s.analyst_comment ? (
                          <div className="small" style={{ marginTop: 6 }}>
                            {s.analyst_comment}
                          </div>
                        ) : null}
                      </td>

                      <td data-label="IDs" className="mono small">
                        <div>req: {s.id}</div>
                        <div>case: {s.case_id || "-"}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Building2 size={12} />
                          {s.tenant_id}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="small" style={{ padding: 18 }}>
                      Aucun screening trouvé.
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
};

export default Screenings;