import { Clock, User } from "lucide-react";

export function TopHeader({ title, subtitle, onLogout }: { title: string; subtitle?: string; onLogout: () => void }) {
  return (
    <header className="flex min-h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex flex-shrink-0 items-center gap-3 sm:gap-4">
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <Clock size={13} />
          Du lieu tu he thong
        </div>
        <div className="hidden h-4 w-px bg-border md:block" />
        <button
          type="button"
          onClick={onLogout}
          className="flex min-h-12 items-center gap-2 rounded-lg px-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label="Dang xuat"
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={15} className="text-primary" />
          </div>
          <span className="hidden text-sm font-medium text-foreground sm:inline">Nguoi cham soc</span>
        </button>
      </div>
    </header>
  );
}
