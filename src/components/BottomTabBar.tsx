import { Link, useLocation } from "@tanstack/react-router";
import { Home, Baby, Calendar, BookHeart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/baby", label: "Baby", icon: Baby },
  { to: "/appointments", label: "Calendar", icon: Calendar },
  { to: "/journal", label: "Journal", icon: BookHeart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomTabBar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 py-2">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/dashboard" && pathname.startsWith(to));
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-all",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                    active && "bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-soft)]",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}