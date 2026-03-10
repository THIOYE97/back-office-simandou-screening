// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { setToken } from "../auth/auth";

export default function Login() {
  const nav = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [err,      setErr]      = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setErr(null);
    setBusy(true);
    try {
      const resp = await login(email.trim(), password);
      setToken(resp.access_token);
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Identifiants incorrects.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authShell">
      <form className="authCard" onSubmit={onSubmit} noValidate>

        {/* Brand */}
        <div className="authBrand">
          <div className="brandMark">
            {/* Shield icon */}
            <svg viewBox="0 0 24 24">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>
              Simandou-Screening
            </div>
            <div className="small" style={{ marginTop: 1, opacity: 0.7 }}>Back Office · Admin</div>
          </div>
        </div>

        {/* Heading */}
        <div className="authTitle">Connexion</div>
        <div className="authSub">Accédez à votre espace d'administration sécurisé.</div>

        {/* Error */}
        {err && (
          <div className="alert alertErr animate-slideUp" style={{ marginBottom: 18, fontSize: 13 }}>
            <span style={{ marginRight: 6 }}>⚠️</span>{err}
          </div>
        )}

        {/* Email */}
        <div className="field" style={{ marginBottom: 12 }}>
          <label className="nice-label" htmlFor="email">Adresse e-mail</label>
          <div className="inputWrapper">
            <svg className="inputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/>
              <path d="m2 7 10 7 10-7"/>
            </svg>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@simandou.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="field" style={{ marginBottom: 24 }}>
          <label className="nice-label" htmlFor="password">Mot de passe</label>
          <div className="inputWrapper">
            <svg className="inputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="password"
              className="input"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              style={{ paddingRight: 44 }}
            />
            {/* Toggle visibility */}
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--muted2)", padding: 4, lineHeight: 0,
              }}
              tabIndex={-1}
              title={showPwd ? "Masquer" : "Afficher"}
            >
              {showPwd ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btnPrimary btn-lg btn-full"
          disabled={busy || !email.trim() || !password}
        >
          {busy ? (
            <>
              <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </>
          )}
        </button>

        {/* Footer note */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--muted2)" }}>
          Accès réservé aux administrateurs autorisés.
        </p>
      </form>
    </div>
  );
}