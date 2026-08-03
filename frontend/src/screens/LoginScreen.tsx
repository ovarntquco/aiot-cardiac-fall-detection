import { useState, useRef } from "react";
import { Activity, AlertTriangle, Eye, EyeOff, Heart, Lock, MapPin, Shield, User } from "lucide-react";
import { StateMessage } from "../components/common/StateMessage";
import { useNavigate } from "react-router";
import { screenPaths } from "../types";
import { fetchMyAccount, login, setSessionToken } from "../api";
import { useRole } from "../contexts/RoleContext";

export function LoginScreen() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { setRole } = useRole();
  const loginRunning = useRef(false);

  const submitLogin = async () => {
    if (loginRunning.current) return;
    loginRunning.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await login(email, pw);
      setSessionToken(accessToken);
      const { account } = await fetchMyAccount();
      const role = account.user?.role ?? null;
      setRole(role);
      
      navigate(role === "caregiver" ? screenPaths.patients : screenPaths.home, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Cannot log in. Please try again.");
    } finally {
      setSubmitting(false);
      loginRunning.current = false;
    }
  };

  return (
    <div className="flex h-full w-full overflow-y-auto" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <div className="hidden w-[420px] flex-shrink-0 flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">CareWatch</span>
        </div>

        <div>
          <div className="mb-8">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-6">
              <Heart size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-3">
              Smart Health
              <br />
              Monitoring
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Heart rate, SpO2, and alert history monitoring system for the elderly.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Activity size={14} />, text: "Monitor SpO2 and heart rate" },
              { icon: <AlertTriangle size={14} />, text: "Store alert history" },
              { icon: <MapPin size={14} />, text: "Track GPS location" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3 text-blue-100 text-sm">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                {feature.text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300 text-xs">2026 CareWatch Health Systems</p>
      </div>

      <div className="flex min-h-full flex-1 items-center justify-center bg-background px-5 py-8 sm:px-8 lg:p-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">CareWatch</p>
              <p className="text-xs text-muted-foreground">Health Monitoring</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Log in to caregiver account</p>
          </div>

          {error && <div className="mb-5"><StateMessage title="Login failed" message={error} tone="error" compact /></div>}

          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              await submitLogin();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email or username</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-12 w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(event) => setPw(event.target.value)}
                  className="password-input min-h-12 w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-12 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  disabled={submitting}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="min-h-12 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
