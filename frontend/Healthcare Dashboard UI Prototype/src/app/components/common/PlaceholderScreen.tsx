import { AlertTriangle } from "lucide-react";
import type { Screen } from "../../types";
import { DetailCell } from "./DetailCell";
import { DashboardLayout } from "../layout/DashboardLayout";

export function PlaceholderScreen({
  screen,
  onNav,
  title,
  useCase,
  requirements,
  modulePath,
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
      <div className="max-w-2xl bg-card rounded-lg border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Dang phat trien</p>
            <p className="text-sm text-muted-foreground mt-1">
              Module nay da duoc scaffold de tiep tuc phat trien, nhung chua co business logic hay du lieu that.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <DetailCell label="Use case" value={useCase} />
          <DetailCell label="FR" value={requirements.join(", ")} />
          <DetailCell label="Module" value={modulePath} />
        </div>
        <div className="bg-background rounded-lg border border-border p-3.5 mt-4">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1.5">TODO tiep theo</p>
          <p className="text-sm text-foreground">{todo}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
