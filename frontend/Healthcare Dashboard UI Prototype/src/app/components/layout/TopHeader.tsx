import { Clock, User } from "lucide-react";

export function TopHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={13} />
          Dong bo lan cuoi: hom nay
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={15} className="text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">Tran Thi Lan</span>
        </div>
      </div>
    </header>
  );
}
