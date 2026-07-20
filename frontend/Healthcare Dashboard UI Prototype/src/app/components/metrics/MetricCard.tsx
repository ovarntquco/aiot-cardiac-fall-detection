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
    <div className="bg-card rounded-lg border border-border p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
              <span style={{ color }}>{icon}</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-bold text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {value}
            </span>
            <span className="text-base text-muted-foreground mb-1">{unit}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>{statusLabel}</span>
      </div>

      <div className="h-36">
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
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
