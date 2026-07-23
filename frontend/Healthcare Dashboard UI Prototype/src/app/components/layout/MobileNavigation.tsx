import { AlertTriangle, Bell, Home, MapPin, Settings } from "lucide-react";
import type { ReactNode } from "react";
import type { Screen } from "../../types";

const mobileNavItems: { id: Screen; label: string; icon: ReactNode }[] = [
  { id: "home", label: "Tong quan", icon: <Home size={19} /> },
  { id: "alerts", label: "Canh bao", icon: <Bell size={19} /> },
  { id: "sos", label: "SOS", icon: <AlertTriangle size={19} /> },
  { id: "gps", label: "GPS", icon: <MapPin size={19} /> },
  { id: "settings", label: "Cai dat", icon: <Settings size={19} /> },
];

export function MobileNavigation({ current, onNav }: { current: Screen; onNav: (screen: Screen) => void }) {
  return (
    <nav className="grid flex-shrink-0 grid-cols-5 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Dieu huong chinh">
      {mobileNavItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onNav(item.id)}
          className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
            current === item.id ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          aria-current={current === item.id ? "page" : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
