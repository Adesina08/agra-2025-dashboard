import { useEffect, useMemo, useState } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = useMemo(() => {
    if (!mounted) return theme === "dark";
    return (theme === "system" ? resolvedTheme : theme) === "dark";
  }, [mounted, theme, resolvedTheme]);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-3 py-1.5",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
        "shadow-[0_10px_40px_-28px_rgba(0,0,0,0.55)] dark:shadow-[0_10px_40px_-28px_rgba(0,0,0,0.75)]",
        className
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground",
          "bg-card/70 shadow-inner shadow-black/5",
          mounted && (isDark ? "text-yellow-200" : "text-amber-500")
        )}
      >
        {isDark ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </span>
      <div className="flex flex-col items-start">
        <span className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Theme</span>
        <span className="text-sm font-medium text-foreground">{isDark ? "Dark" : "Light"} mode</span>
      </div>
    </button>
  );
}
