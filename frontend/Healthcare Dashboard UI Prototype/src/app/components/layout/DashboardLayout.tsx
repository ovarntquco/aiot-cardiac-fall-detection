import type { ReactNode } from "react";
import type { Screen } from "../../types";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";

export function DashboardLayout({
  screen,
  onNav,
  title,
  subtitle,
  children,
}: {
  screen: Screen;
  onNav: (screen: Screen) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full" style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar current={screen} onNav={onNav} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-8 bg-background">{children}</main>
      </div>
    </div>
  );
}
