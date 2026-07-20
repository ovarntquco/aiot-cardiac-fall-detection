import { useState } from "react";
import { Activity, AlertTriangle, Eye, EyeOff, Heart, Lock, MapPin, Shield, User } from "lucide-react";

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("lan.tran@giadinh.com");
  const [pw, setPw] = useState("dev-password");

  return (
    <div className="h-full w-full flex" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <div className="w-[420px] flex-shrink-0 bg-primary flex flex-col justify-between p-12">
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

      <div className="flex-1 bg-background flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Chao mung tro lai</h1>
            <p className="text-sm text-muted-foreground">Dang nhap vao tai khoan nguoi cham soc</p>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin();
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="ban@example.com"
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
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  placeholder="Nhap mat khau"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? "An mat khau" : "Hien mat khau"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
              Dang nhap
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
