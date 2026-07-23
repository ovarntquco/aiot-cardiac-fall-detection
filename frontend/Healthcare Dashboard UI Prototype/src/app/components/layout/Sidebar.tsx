import type { ReactNode } from "react";
import { AlertTriangle, Bell, Home, LogOut, MapPin, Settings, Shield, User, Wifi } from "lucide-react";
import type { Screen } from "../../types";

const navItems: { id: Screen; label: string; icon: ReactNode }[] = [
  { id: "home", label: "Tong quan", icon: <Home size={18} /> },
  { id: "alerts", label: "Lich su canh bao", icon: <Bell size={18} /> },
  { id: "sos", label: "SOS", icon: <AlertTriangle size={18} /> },
  { id: "gps", label: "Vi tri GPS", icon: <MapPin size={18} /> },
  { id: "settings", label: "Cai dat", icon: <Settings size={18} /> },
];

export function Sidebar({
  current,
  onNav,
  patient,
}: {
  current: Screen;
  onNav: (screen: Screen) => void;
  patient?: {
    name?: string;
    age?: number;
    deviceStatus?: string;
  } | null;
}) {
  const patientName = patient?.name || "Benh nhan dang theo doi";
  const patientMeta = patient?.age ? `Benh nhan - ${patient.age} tuoi` : "Chua co thong tin chi tiet";
  const isConnected = patient?.deviceStatus === "CONNECTED";

  return (
    <aside className="hidden h-full w-60 flex-shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">CareWatch</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">Theo doi suc khoe</p>
        </div>
      </div>

      <div className="mx-4 mt-4 mb-2 p-3 rounded-lg bg-secondary flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">{patientName}</p>
          <p className="truncate text-[10px] text-muted-foreground">{patientMeta}</p>
        </div>
        <div className={`ml-auto h-2 w-2 flex-shrink-0 rounded-full ${isConnected ? "bg-emerald-500" : "bg-slate-300"}`} />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNav(item.id)}
            className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
              current === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-current={current === item.id ? "page" : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi size={13} className={isConnected ? "text-emerald-500" : "text-slate-400"} />
          {isConnected ? "Thiet bi da ket noi" : "Chua co trang thai thiet bi"}
        </div>
        <button
          type="button"
          onClick={() => onNav("login")}
          className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <LogOut size={18} />
          Dang xuat
        </button>
      </div>
    </aside>
  );
}
