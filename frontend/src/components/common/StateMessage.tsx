export function StateMessage({
  title,
  message,
  tone = "info",
  compact = false,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  tone?: "info" | "warning" | "error" | "empty";
  compact?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const toneClass = tone === "error"
    ? "bg-red-50 border-red-100 text-red-700"
    : tone === "warning"
      ? "bg-amber-50 border-amber-100 text-amber-800"
    : tone === "empty"
      ? "bg-slate-50 border-slate-200 text-slate-700"
      : "bg-blue-50 border-blue-100 text-blue-800";

  return (
    <div className={`${compact ? "p-4" : "p-6"} rounded-2xl border shadow-sm ${toneClass}`} role={tone === "error" ? "alert" : "status"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm opacity-80">{message}</p>
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="min-h-12 flex-shrink-0 self-start rounded-lg border border-current/20 bg-white/70 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30 sm:self-center"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
