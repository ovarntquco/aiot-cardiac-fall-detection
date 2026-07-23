import type { ReactNode } from "react";

export function ThresholdCard({
  icon,
  title,
  values,
}: {
  icon: ReactNode;
  title: string;
  values: { label: string; value: number; unit: string }[];
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center">{icon}</div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        {values.map((item) => (
          <div key={item.label} className="bg-background rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
