import { useMemo, useState } from "react";
import { Download, Target } from "lucide-react";
import { FarmerData, YouthData } from "@/data/mockData";
import { QUOTA_ROWS, QuotaProgram } from "@/data/quotaData";
import { cn } from "@/lib/utils";
import { headerTone, Variant } from "./variantStyles";

type FarmerOrYouth = FarmerData | YouthData;

interface QuotaTrackerProps {
  variant: Variant;
  program: QuotaProgram;
  country: string | undefined;
  data: FarmerOrYouth[];
  title?: string;
}

export function QuotaTracker({
  variant,
  program,
  country,
  data,
  title = "Quota Tracker",
}: QuotaTrackerProps) {
  const [view, setView] = useState<"total" | "gender">("total");

  const normalizedCountry = (country || "").trim().toLowerCase();

  const quotaRows = useMemo(
    () =>
      QUOTA_ROWS.filter((q) => {
        const matchProgram = q.program === program;
        const matchCountry =
          !normalizedCountry ||
          q.country.toLowerCase().includes(normalizedCountry) ||
          normalizedCountry.includes(q.country.toLowerCase());
        return matchProgram && matchCountry;
      }),
    [normalizedCountry, program]
  );

  const matchesLocation = (row: FarmerOrYouth, region: string, district: string) => {
    const r = (row.region || "").trim().toLowerCase();
    const d = (row.district || "").trim().toLowerCase();
    return r.includes(region.toLowerCase()) && d.includes(district.toLowerCase());
  };

  const rows = useMemo(() => {
    return quotaRows.map((q) => {
      const region = q.region;
      const district = q.district;

      const subset = data.filter((row) => matchesLocation(row, region, district));

      const totalTarget =
        q.targets["Total"] ?? (q.targets["Male"] ?? 0) + (q.targets["Female"] ?? 0);

      const totalAchieved = subset.length;

      const maleAchieved = subset.filter((r) => r.gender === "Male").length;
      const femaleAchieved = subset.filter((r) => r.gender === "Female").length;

      const maleTarget = q.targets["Male"] ?? 0;
      const femaleTarget = q.targets["Female"] ?? 0;

      return {
        country: q.country,
        region,
        district,
        totalTarget,
        totalAchieved,
        totalBalance: totalTarget - totalAchieved,
        maleTarget,
        femaleTarget,
        maleAchieved,
        femaleAchieved,
        maleBalance: maleTarget - maleAchieved,
        femaleBalance: femaleTarget - femaleAchieved,
      };
    });
  }, [quotaRows, data]);

  const totalTargetSum = rows.reduce((acc, r) => acc + r.totalTarget, 0);
  const totalAchievedSum = rows.reduce((acc, r) => acc + r.totalAchieved, 0);
  const totalBalanceSum = totalTargetSum - totalAchievedSum;

  return (
    <div className="minimal-card">
      <div
        className={cn(
          "flex items-center justify-between gap-3 mb-4 rounded-xl px-4 py-3 border text-sm",
          headerTone[variant]
        )}
      >
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wide opacity-80">
              Quota – {program === "farmer" ? "Farmer (AGRA)" : program === "youth_work" ? "Youth in Work" : "Youth Outreach"}
            </span>
            <span className="text-sm font-semibold">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-background/40 p-1 border border-border/40">
            <button
              type="button"
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
                view === "total"
                  ? "bg-background text-foreground border-border shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
              )}
              onClick={() => setView("total")}
            >
              Total
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-colors",
                view === "gender"
                  ? "bg-background text-foreground border-border shadow-sm"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
              )}
              onClick={() => setView("gender")}
            >
              By gender
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-border hover:bg-background/60"
            onClick={() => {
              const headers =
                view === "total"
                  ? ["Country", "Region", "District", "Target", "Achieved", "Balance"]
                  : [
                      "Country",
                      "Region",
                      "District",
                      "Target_Male",
                      "Achieved_Male",
                      "Balance_Male",
                      "Target_Female",
                      "Achieved_Female",
                      "Balance_Female",
                    ];
              const lines = [
                headers.join(","),
                ...rows.map((r) =>
                  view === "total"
                    ? [
                        r.country,
                        r.region,
                        r.district,
                        Math.round(r.totalTarget),
                        r.totalAchieved,
                        Math.round(r.totalBalance),
                      ].join(",")
                    : [
                        r.country,
                        r.region,
                        r.district,
                        Math.round(r.maleTarget),
                        r.maleAchieved,
                        Math.round(r.maleBalance),
                        Math.round(r.femaleTarget),
                        r.femaleAchieved,
                        Math.round(r.femaleBalance),
                      ].join(",")
                ),
              ];
              const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${program}-quota-${view}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
        <div className="rounded-lg bg-background/60 border border-border/60 px-3 py-2">
          <div className="opacity-70">Target interviews</div>
          <div className="font-semibold">{Math.round(totalTargetSum).toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-background/60 border border-border/60 px-3 py-2">
          <div className="opacity-70">Achieved interviews</div>
          <div className="font-semibold text-emerald-400">{totalAchievedSum.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-background/60 border border-border/60 px-3 py-2">
          <div className="opacity-70">Balance</div>
          <div className={cn("font-semibold", totalBalanceSum >= 0 ? "text-amber-300" : "text-rose-400")}>
            {Math.round(totalBalanceSum).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="border border-border/60 rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-3 py-2">Region</th>
              <th className="text-left px-3 py-2">District</th>
              {view === "total" ? (
                <>
                  <th className="text-right px-3 py-2">Target</th>
                  <th className="text-right px-3 py-2">Achieved</th>
                  <th className="text-right px-3 py-2">Balance</th>
                </>
              ) : (
                <>
                  <th className="text-right px-3 py-2">Target (F)</th>
                  <th className="text-right px-3 py-2">Achieved (F)</th>
                  <th className="text-right px-3 py-2">Balance (F)</th>
                  <th className="text-right px-3 py-2">Target (M)</th>
                  <th className="text-right px-3 py-2">Achieved (M)</th>
                  <th className="text-right px-3 py-2">Balance (M)</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.region}-${r.district}`} className="border-t border-border/40">
                <td className="px-3 py-2">{r.region}</td>
                <td className="px-3 py-2">{r.district}</td>
                {view === "total" ? (
                  <>
                    <td className="px-3 py-2 text-right">{Math.round(r.totalTarget)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{r.totalAchieved}</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right",
                        r.totalBalance >= 0 ? "text-amber-300" : "text-rose-400"
                      )}
                    >
                      {Math.round(r.totalBalance)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 text-right">{Math.round(r.femaleTarget)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{r.femaleAchieved}</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right",
                        r.femaleBalance >= 0 ? "text-amber-300" : "text-rose-400"
                      )}
                    >
                      {Math.round(r.femaleBalance)}
                    </td>
                    <td className="px-3 py-2 text-right">{Math.round(r.maleTarget)}</td>
                    <td className="px-3 py-2 text-right text-emerald-400">{r.maleAchieved}</td>
                    <td
                      className={cn(
                        "px-3 py-2 text-right",
                        r.maleBalance >= 0 ? "text-amber-300" : "text-rose-400"
                      )}
                    >
                      {Math.round(r.maleBalance)}
                    </td>
                  </>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={view === "total" ? 5 : 8}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  No quota configuration found for this country/program.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
