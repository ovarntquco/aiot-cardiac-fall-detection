import type { ReactNode } from "react";
import type { Screen } from "../../types";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function DashboardLayout({
  screen,
  onNav,
  title,
  subtitle,
  children,
  patient,
}: {
  screen: Screen;
  onNav: (screen: Screen) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  patient?: {
    name?: string;
    age?: number;
    deviceStatus?: string;
  } | null;
}) {
  return (
    <div className="flex h-full w-full" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={onNav} patient={patient} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={title} subtitle={subtitle} onLogout={() => onNav("login")} />
        <main className="flex-1 overflow-y-auto bg-background px-4 py-5 sm:px-6 sm:py-6 lg:p-8">{children}</main>
        <MobileNavigation current={screen} onNav={onNav} />
      </div>
    </div>
  );
}
