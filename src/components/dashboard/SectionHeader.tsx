import { cn } from "@/lib/utils";

type AccentVariant = "farmer" | "enterprise" | "youth" | "default";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  accent?: AccentVariant;
  className?: string;
}

const accentMap: Record<AccentVariant, string> = {
  default: "text-primary",
  farmer: "text-farmer",
  enterprise: "text-enterprise",
  youth: "text-youth",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  accent = "default",
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {/* Eyebrow + divider */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground",
            accentMap[accent]
          )}
        >
          {eyebrow}
        </span>
        <div className="h-px flex-1 bg-border/60" />
      </div>

      {/* Title + description */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
