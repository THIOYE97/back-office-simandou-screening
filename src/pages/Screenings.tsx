// src/pages/Screenings.tsx
import React, { useEffect, useMemo, useState } from "react";
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

const Pill: React.FC<{ txt?: string | null; tone?: "ok" | "warn" | "bad" | "neutral" }> = ({
  txt,
  tone = "neutral",
}) => {
  const cls =
    tone === "ok" ? "pill pillOk" : tone === "warn" ? "pill pillWarn" : tone === "bad" ? "pill pillBad" : "pill";
  return <span className={cls}>{txt || "-"}</span>;
};

const LS_KEY = "active_tenant_id";

const Screenings: React.FC = () => {
  const [items, setItems] = useState<ScreeningItem[]>([]);
  const [limit, setLimit] = useState<number>(50);
  const [offset, setOffset] = useState<number>(0);

  const [status, setStatus] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [riskLevel, setRiskLevel] = useState<string>("");

  // tenants switch
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

      // si aucun tenant choisi, on prend le 1er
      if (!localStorage.getItem(LS_KEY) && list[0]?.id) {
        localStorage.setItem(LS_KEY, list[0].id);
        setTenantId(list[0].id);
      }
    } catch {
      // pas bloquant: on peut quand même afficher screenings
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

  // init
  useEffect(() => {
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload list (filtres/pagination)
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const applyTenant = async (id: string) => {
    // si id vide => on enlève le header X-Tenant-Id (donc “tenant courant” / tout selon backend)
    if (!id) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, id);

    setTenantId(id);
    setOffset(0);
    await load();
  };

  return (
    <div className="page">
      <div className="pageTitle">
        <div>
          <h1 className="h1">Screenings</h1>
          <p className="sub">
            Tous les screenings (ordre d’heure), email du user, nom screené, résultat engine et décision analyst.
          </p>
        </div>

        <div className="btnGroup">
          <button className="btn btnGhost btnSm" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Rafraîchir"}
          </button>
        </div>
      </div>

      <div className="card cardPad">
        <div className="filtersGrid">
          {/* Tenant switch */}
          <div className="field fg-3">
            <div className="label">Tenant</div>
            <select
              className="select"
              value={tenantId}
              onChange={(e) => applyTenant(e.target.value)}
              title="Change tenant"
            >
              {/* option “tous” => enlève active_tenant_id (utile si super_admin) */}
              <option value="">Tous / tenant courant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug})
                </option>
              ))}
            </select>
            <div className="small mono" style={{ marginTop: 6, opacity: 0.8 }}>
              active: {tenantId ? tenantId : "—"}
            </div>
          </div>

          <div className="field fg-3">
            <div className="label">Status</div>
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

          <div className="field fg-3">
            <div className="label">Provider</div>
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

          <div className="field fg-3">
            <div className="label">Risk</div>
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

          <div className="field fg-3">
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

          <div className="fg-12">
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div className="small">
                Tip: tu peux taper juste une partie, ex: <span className="mono">DON</span>, <span className="mono">INTE</span>,{" "}
                <span className="mono">HIG</span>.
              </div>

              <div className="btnGroup">
                <button
                  className="btn btnGhost btnSm"
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  disabled={offset === 0 || loading}
                >
                  Prev
                </button>
                <button className="btn btnGhost btnSm" onClick={() => setOffset(offset + limit)} disabled={loading}>
                  Next
                </button>
                <span className="small mono">offset={offset}</span>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div
            className="alert"
            style={{ marginTop: 12, borderColor: "rgba(255,77,109,.45)", background: "rgba(255,77,109,.12)" }}
          >
            <div className="strong">Erreur</div>
            <div className="hr" />
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{error}</pre>
          </div>
        ) : null}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="tableResponsive">
          <table className="table">
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
                      <div className="strong">{fmt(s.created_at)}</div>
                      <div className="small">done: {fmt(s.completed_at)}</div>
                    </td>

                    <td data-label="User">
                      <div className="strong">{s.triggered_by_email || "(unknown)"}</div>
                      <div className="mono small">{s.triggered_by || "-"}</div>
                    </td>

                    <td data-label="Nom screené">
                      <div className="strong">{s.screened_name || "(no name)"}</div>
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
                      <div className="strong">{s.analyst_decision || "-"}</div>
                      <div className="small">
                        {s.analyst_decided_by_email || ""}{" "}
                        {s.analyst_decided_at ? <span>• {fmt(s.analyst_decided_at)}</span> : null}
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
                      <div>tenant: {s.tenant_id}</div>
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
  );
};

export default Screenings;

