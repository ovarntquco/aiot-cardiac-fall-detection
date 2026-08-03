import type { ReactNode } from "react";
import { Activity, Bell, Home, LogOut, MapPin, Settings, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { useRole } from "../../contexts/RoleContext";
import type { PatientSection, Screen } from "../../types";

type NavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  nested?: boolean;
};

export function Sidebar({
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

  const navItems: NavItem[] = role === "caregiver"
    ? [
        {
          key: "patients",
          label: "Patient List",
          icon: <Users size={18} />,
          active: current === "patients" && !patientSection,
          onClick: () => onNav("patients"),
        },
        ...(patientPath ? [
          createPatientItem("overview", "Health Overview", <Activity size={18} />),
          createPatientItem("alerts", "Alert History", <Bell size={18} />),
          createPatientItem("gps", "GPS Location", <MapPin size={18} />),
        ] : []),
      ]
    : [
        createScreenItem("home", "Overview", <Home size={18} />),
        createScreenItem("alerts", "Alert History", <Bell size={18} />),
        createScreenItem("gps", "GPS Location", <MapPin size={18} />),
        createScreenItem("settings", "Settings", <Settings size={18} />),
      ];

  function createScreenItem(id: Screen, label: string, icon: ReactNode): NavItem {
    return { key: id, label, icon, active: current === id, onClick: () => onNav(id) };
  }

  function createPatientItem(section: PatientSection, label: string, icon: ReactNode): NavItem {
    return {
      key: `patient-${section}`,
      label,
      icon,
      active: patientSection === section,
      onClick: () => navigate(`${patientPath}/${section}`),
      nested: true,
    };
  }

  return (
    <aside className="hidden h-full w-72 flex-shrink-0 flex-col border-r border-white/10 bg-[#0b172a] text-slate-200 shadow-xl lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/30">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="text-base font-bold leading-none text-white">CareWatch</p>
          <p className="mt-1 text-xs leading-none text-slate-400">Health Monitoring</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            className={`flex min-h-12 w-full items-center gap-3 rounded-xl py-2.5 pr-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/60 ${item.nested ? "pl-7" : "pl-3.5"} ${
              item.active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-950/25"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
            aria-current={item.active ? "page" : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-5">
        <button
          type="button"
          onClick={() => onNav("login")}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/40"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
