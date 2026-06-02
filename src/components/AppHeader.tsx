import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
}

export function AppHeader({ title, subtitle, rightSlot }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <div>
          <h1 className="text-xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {rightSlot ?? (
            <Link
              to="/appointments"
              aria-label="Notifications"
              className="rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-accent transition"
            >
              <Bell className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}