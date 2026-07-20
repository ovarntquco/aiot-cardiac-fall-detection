export function StateMessage({
  title,
  message,
  tone = "info",
  compact = false,
}: {
  title: string;
  message: string;
  tone?: "info" | "error" | "empty";
  compact?: boolean;
}) {
  const toneClass = tone === "error"
    ? "bg-red-50 border-red-100 text-red-700"
    : tone === "empty"
      ? "bg-slate-50 border-slate-200 text-slate-700"
      : "bg-blue-50 border-blue-100 text-blue-700";

  return (
    <div className={`${compact ? "p-4" : "p-6"} rounded-lg border ${toneClass}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm mt-1 opacity-80">{message}</p>
    </div>
  );
}
