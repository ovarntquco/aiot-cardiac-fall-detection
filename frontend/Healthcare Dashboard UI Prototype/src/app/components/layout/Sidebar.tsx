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

export function Sidebar({ current, onNav }: { current: Screen; onNav: (screen: Screen) => void }) {
  return (
    <aside className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
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
          <p className="text-xs font-semibold text-foreground truncate">Nguyen Thi Hoa</p>
          <p className="text-[10px] text-muted-foreground">Benh nhan - 78 tuoi</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 ml-auto" />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              current === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Wifi size={13} className="text-emerald-500" />
          Thiet bi da ket noi
        </div>
        <button
          onClick={() => onNav("login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Dang xuat
        </button>
      </div>
    </aside>
  );
}
