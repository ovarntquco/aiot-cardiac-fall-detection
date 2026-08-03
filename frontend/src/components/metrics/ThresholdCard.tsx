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
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">{icon}</div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        {values.map((item) => (
          <div key={item.label} className="rounded-xl border border-border/70 bg-slate-50 p-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{item.label}</p>
            <p className="text-xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
