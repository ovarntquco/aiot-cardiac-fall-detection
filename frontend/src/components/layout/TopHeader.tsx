import { Activity, User } from "lucide-react";
import { useRole } from "../../contexts/RoleContext";

export function TopHeader({ title, subtitle, onHome }: { title: string; subtitle?: string; onHome: () => void }) {
  const { role } = useRole();

  return (
    <header className="flex min-h-20 flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-7 lg:px-10">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-bold tracking-tight text-foreground sm:text-xl">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 md:flex">
          <Activity size={13} />
          Live system
        </div>
        <div className="hidden h-4 w-px bg-border md:block" />
        <button
          type="button"
          onClick={onHome}
          className="flex min-h-12 items-center gap-2.5 rounded-xl border border-transparent px-2.5 transition-all hover:border-border hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Go to overview"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <User size={16} />
          </div>
          <span className="hidden text-sm font-medium capitalize text-foreground sm:inline">
            {role ?? "Account"}
          </span>
        </button>
      </div>
    </header>
  );
}
