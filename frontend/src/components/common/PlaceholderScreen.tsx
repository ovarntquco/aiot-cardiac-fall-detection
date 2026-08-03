import { AlertTriangle } from "lucide-react";
import type { Screen } from "../../types";
import { DashboardLayout } from "../layout/DashboardLayout";

export function PlaceholderScreen({
  screen,
  onNav,
  title,
  useCase,
  requirements,
  todo,
}: {
  screen: Screen;
  onNav: (screen: Screen) => void;
  title: string;
  useCase: string;
  requirements: string[];
  modulePath: string;
  todo: string;
}) {
  return (
    <DashboardLayout screen={screen} onNav={onNav} title={title} subtitle={`${useCase} - ${requirements.join(", ")}`}>
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Under Development</p>
            <p className="text-sm text-muted-foreground mt-1">
              This module has been scaffolded for future development, but does not yet contain business logic or real data.
            </p>
          </div>
        </div>
        <div className="bg-background rounded-lg border border-border p-3.5 mt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">Next TODO</p>
          <p className="text-sm text-foreground">{todo}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
