import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { headerTone, Variant } from "./variantStyles";

interface CountryFilterProps {
  countries: string[];
  selected: string;
  onChange: (value: string) => void;
  variant: Variant;
}

export function CountryFilter({
  countries,
  selected,
  onChange,
  variant,
}: CountryFilterProps) {
  const hasCountries = countries.length > 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-sm",
        headerTone[variant]
      )}
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/60 border border-border/50">
          <Globe2 className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Filter by country</span>
          <span className="text-sm font-semibold">Focus the dashboard on a specific country</span>
        </div>
      </div>

      <Select value={selected} onValueChange={onChange} disabled={!hasCountries}>
        <SelectTrigger className="w-[220px] bg-background/70 text-foreground">
          <SelectValue placeholder="Choose a country" />
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground">
          <SelectItem value="all">All countries</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
