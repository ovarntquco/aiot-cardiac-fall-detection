import type { ReactNode } from "react";
import type { PatientSection, Screen } from "../../types";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { useRole } from "../../contexts/RoleContext";

export function DashboardLayout({
  screen,
  onNav,
  title,
  subtitle,
  children,
  patientId,
  patientSection,
}: {
  screen: Screen;
  onNav: (screen: Screen) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  patientId?: string;
  patientSection?: PatientSection;
}) {
  const { role } = useRole();

  return (
    <div className="flex h-full w-full" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={onNav} patientId={patientId} patientSection={patientSection} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopHeader title={title} subtitle={subtitle} onHome={() => onNav(role === "caregiver" ? "patients" : "home")} />
        <main className="flex-1 overflow-y-auto bg-background/80 px-4 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
          <div className="mx-auto w-full max-w-[90rem]">{children}</div>
        </main>
        <MobileNavigation current={screen} onNav={onNav} patientId={patientId} patientSection={patientSection} />
      </div>
    </div>
  );
}
