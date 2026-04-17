// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";
import { login } from "../api";
import { setToken } from "../auth/auth";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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
    <div
      className="authShell"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg-base, #0A0A0B)",
      }}
    >
      <form
        className="authCard"
        onSubmit={onSubmit}
        noValidate
        style={{
          width: "100%",
          maxWidth: 420,
          padding: 32,
          borderRadius: 20,
          background: "var(--bg-card, #141518)",
          border: "1px solid var(--border, rgba(255,255,255,0.08))",
          boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "var(--accent-light, rgba(45,127,214,0.14))",
              border: "1px solid var(--border-active, rgba(45,127,214,0.28))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-accent, #5BA8F5)",
              flexShrink: 0,
            }}
          >
            <Shield size={20} strokeWidth={2.1} />
          </div>

          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: "-0.02em",
                color: "var(--text-primary, #F3F4F6)",
              }}
            >
              Simandou Screening
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                color: "var(--text-muted, rgba(243,244,246,0.45))",
              }}
            >
              Back Office · Admin
            </div>
          </div>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "var(--text-primary, #F3F4F6)",
              marginBottom: 8,
            }}
          >
            Connexion
          </div>
          <div
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: "var(--text-secondary, rgba(243,244,246,0.72))",
            }}
          >
            Accédez à votre espace d'administration sécurisé.
          </div>
        </div>

        {/* Error */}
        {err && (
          <div
            className="alert alertErr"
            style={{
              marginBottom: 18,
              fontSize: 13,
              borderRadius: 12,
              padding: "12px 14px",
              border: "1px solid rgba(232,64,64,0.28)",
              background: "rgba(232,64,64,0.10)",
              color: "#E84040",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle size={16} strokeWidth={2.2} />
            <span>{err}</span>
          </div>
        )}

        {/* Email */}
        <div className="field" style={{ marginBottom: 14 }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted, rgba(243,244,246,0.45))",
            }}
          >
            Adresse e-mail
          </label>

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
              <Mail size={16} strokeWidth={2.1} />
            </span>

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
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        {/* Password */}
        <div className="field" style={{ marginBottom: 22 }}>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted, rgba(243,244,246,0.45))",
            }}
          >
            Mot de passe
          </label>

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
              <Lock size={16} strokeWidth={2.1} />
            </span>

            <input
              id="password"
              className="input"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              style={{ paddingLeft: 40, paddingRight: 44 }}
            />

            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted, rgba(243,244,246,0.45))",
                padding: 4,
                lineHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              tabIndex={-1}
              title={showPwd ? "Masquer" : "Afficher"}
            >
              {showPwd ? (
                <EyeOff size={16} strokeWidth={2.1} />
              ) : (
                <Eye size={16} strokeWidth={2.1} />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btnPrimary btn-lg btn-full"
          disabled={busy || !email.trim() || !password}
          style={{
            width: "100%",
            justifyContent: "center",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 18px",
            borderRadius: 12,
            textDecoration: "none",
          }}
        >
          {busy ? (
            <>
              <Loader2 size={16} strokeWidth={2.4} className="animate-spin" />
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight size={16} strokeWidth={2.4} />
            </>
          )}
        </button>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            fontSize: 12,
            color: "var(--text-muted, rgba(243,244,246,0.45))",
          }}
        >
          Accès réservé aux administrateurs autorisés.
        </p>
      </form>
    </div>
  );
}