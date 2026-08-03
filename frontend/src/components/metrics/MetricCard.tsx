import type { ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricStatus } from "../../types";

export function MetricCard({
  label,
  value,
  unit,
  status,
  statusLabel,
  icon,
  color,
  data,
  min,
  max,
  refLine,
}: {
  label: string;
  value: number;
  unit: string;
  status: MetricStatus;
  statusLabel: string;
  icon: ReactNode;
  color: string;
  data: { time: string; value: number }[];
  min: number;
  max: number;
  refLine?: number;
}) {
  const statusColors: Record<MetricStatus, string> = {
    normal: "text-emerald-600 bg-emerald-50",
    warning: "text-amber-600 bg-amber-50",
    critical: "text-red-600 bg-red-50",
  };

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border/80 bg-card p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
              <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">{label}</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl" style={{ fontFamily: "'DM Mono', monospace" }}>
              {value}
            </span>
            <span className="text-base text-muted-foreground mb-1">{unit}</span>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusColors[status]}`}>{statusLabel}</span>
      </div>

      <div className="h-44 rounded-xl bg-slate-50/70 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} interval={2} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} tickLine={false} axisLine={false} domain={[min, max]} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#6B7280" }}
            />
            {refLine !== undefined && <ReferenceLine y={refLine} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} />}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 5, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
