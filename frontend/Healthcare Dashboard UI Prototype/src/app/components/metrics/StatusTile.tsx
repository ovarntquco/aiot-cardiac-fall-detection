import type { ReactNode } from "react";

export function StatusTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="bg-card rounded-lg border border-border px-5 py-3.5 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
