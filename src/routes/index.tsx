import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "My Pregnancy Journey — Track every beautiful week" },
      { name: "description", content: "A calming companion: weekly baby growth, symptoms, appointments, weight, kicks and memories." },
      { property: "og:title", content: "My Pregnancy Journey" },
      { property: "og:description", content: "Your beautiful pregnancy companion." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  return (
    <main className="min-h-screen bg-[image:var(--gradient-hero)] flex flex-col items-center justify-between px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
          <Heart className="h-12 w-12 text-primary-foreground" fill="currentColor" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">My Pregnancy Journey</h1>
        <p className="mt-4 text-muted-foreground text-balance">
          A calming companion to track every beautiful week of your pregnancy.
          Baby growth, symptoms, appointments, memories — all in one place.
        </p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <Link
          to="/signup"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground font-semibold shadow-[var(--shadow-soft)] transition active:scale-[0.98]"
        >
          Start your journey
        </Link>
        <Link
          to="/login"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-card text-foreground font-medium border border-border"
        >
          I already have an account
        </Link>
      </div>
    </main>
  );
}
