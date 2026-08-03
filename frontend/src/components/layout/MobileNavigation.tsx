import { Activity, Bell, Home, MapPin, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { useRole } from "../../contexts/RoleContext";
import type { PatientSection, Screen } from "../../types";

type MobileItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
};

export function MobileNavigation({
  current,
  onNav,
  patientId,
  patientSection,
}: {
  current: Screen;
  onNav: (screen: Screen) => void;
  patientId?: string;
  patientSection?: PatientSection;
}) {
  const { role } = useRole();
  const navigate = useNavigate();
  const patientPath = patientId ? `/patients/${encodeURIComponent(patientId)}` : null;

  const items: MobileItem[] = role === "caregiver"
    ? [
        createScreenItem("patients", "Patients", <Users size={19} />, !patientSection),
        ...(patientPath ? [
          createPatientItem("overview", "Health", <Activity size={19} />),
          createPatientItem("alerts", "Alerts", <Bell size={19} />),
          createPatientItem("gps", "GPS", <MapPin size={19} />),
        ] : []),
      ]
    : [
        createScreenItem("home", "Overview", <Home size={19} />),
        createScreenItem("alerts", "Alerts", <Bell size={19} />),
        createScreenItem("gps", "GPS", <MapPin size={19} />),
        createScreenItem("settings", "Settings", <Settings size={19} />),
      ];

  function createScreenItem(id: Screen, label: string, icon: ReactNode, active = current === id): MobileItem {
    return { key: id, label, icon, active, onClick: () => onNav(id) };
  }

  function createPatientItem(section: PatientSection, label: string, icon: ReactNode): MobileItem {
    return {
      key: `patient-${section}`,
      label,
      icon,
      active: patientSection === section,
      onClick: () => navigate(`${patientPath}/${section}`),
    };
  }

  return (
    <nav
      className="grid flex-shrink-0 border-t border-border bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      aria-label="Main Navigation"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.onClick}
          className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 px-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
            item.active ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          aria-current={item.active ? "page" : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
