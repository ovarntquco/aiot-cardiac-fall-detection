export function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-lg border border-border p-3.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground break-words" style={{ fontFamily: "'DM Mono', monospace" }}>
        {value}
      </p>
    </div>
  );
}
