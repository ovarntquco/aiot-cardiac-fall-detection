import { useState } from "react";
import { Activity, AlertTriangle, Eye, EyeOff, Heart, Lock, MapPin, Shield, User } from "lucide-react";
import type { LoginCredentials } from "../adapters/authAdapter";
import { StateMessage } from "../components/common/StateMessage";

export function LoginScreen({ onLogin }: { onLogin: (credentials: LoginCredentials) => Promise<void> }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLogin = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onLogin({ username: email, password: pw });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Khong the dang nhap. Vui long thu lai.");
    } finally {
      setSubmitting(false);
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
              Theo doi suc khoe
              <br />
              thong minh
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              He thong theo doi nhip tim, SpO2 va lich su canh bao cho nguoi cao tuoi.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: <Activity size={14} />, text: "Theo doi SpO2 va nhip tim" },
              { icon: <AlertTriangle size={14} />, text: "Luu tru lich su canh bao" },
              { icon: <MapPin size={14} />, text: "Theo doi vi tri GPS" },
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
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">CareWatch</p>
              <p className="text-xs text-muted-foreground">Theo doi suc khoe</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Chao mung tro lai</h1>
            <p className="text-sm text-muted-foreground">Dang nhap vao tai khoan nguoi cham soc</p>
          </div>

          {error && <div className="mb-5"><StateMessage title="Dang nhap that bai" message={error} tone="error" compact /></div>}

          <form
            className="space-y-5"
            onSubmit={async (event) => {
              event.preventDefault();
              await submitLogin();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email hoac ten dang nhap</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-12 w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="ban@example.com"
                  autoComplete="username"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mat khau</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(event) => setPw(event.target.value)}
                  className="min-h-12 w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-12 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Nhap mat khau"
                  autoComplete="current-password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  aria-label={showPw ? "An mat khau" : "Hien mat khau"}
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
              {submitting ? "Dang dang nhap..." : "Dang nhap"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
