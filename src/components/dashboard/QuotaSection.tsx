import React, { useMemo, Fragment } from "react";
import { cn } from "@/lib/utils";
import { headerTone, Variant } from "./variantStyles";
import {
  type QuotaMetricKey,
  type SegmentQuotaConfig,
  type QuotaRow,
} from "@/data/quotaData";
import { FarmerData, EnterpriseData, YouthData } from "@/data/mockData";

type SubmissionLike = FarmerData | EnterpriseData | YouthData;

interface QuotaSectionProps {
  variant: Variant;
  submissions: SubmissionLike[];
  selectedCountry: string;
  config: SegmentQuotaConfig;
  title?: string;
  controls?: React.ReactNode;
  workFocus?: "Youth in Work" | "Outreach";
}

const getSubmissionCountry = (submission: SubmissionLike) => {
  const record = submission as Record<string, unknown>;

  // Farmer: prefer dccot
  if (typeof record.dccot === "string" && record.dccot.trim()) {
    return record.dccot as string;
  }

  // Enterprise: prefer A1_cal
  if (typeof record.A1_cal === "string" && record.A1_cal.trim()) {
    return record.A1_cal as string;
  }

  // Youth: prefer w1
  if (typeof record.w1 === "string" && record.w1.trim()) {
    return record.w1 as string;
  }

  // Fallback
  return (submission as any).country ?? "";
};

const countryLabel = (country: string) => country || "All Countries";

const youthAgeGroups = ["15-35", "15-25", "18-25", "26-35", "Youth"];

const toLower = (value: unknown) => (value ?? "").toString().trim().toLowerCase();

const isYouthAge = (age: number) => age >= 18 && age <= 35;
const isAdultAge = (age: number) => age > 35;

const isYouthAgeGroupLabel = (ageGroup?: string) => {
  if (!ageGroup) return false;
  const normalized = ageGroup.toLowerCase();
  if (youthAgeGroups.some((match) => normalized.includes(match.toLowerCase()))) return true;

  const numbers = ageGroup.match(/\d+/g)?.map(Number) ?? [];
  if (!numbers.length) return false;

  const maxAge = Math.max(...numbers);
  return maxAge <= 35;
};

const cropIncludes = (cropType: string | undefined, needles: string[]) => {
  if (!cropType) return false;
  const normalized = cropType.toLowerCase();
  return needles.some((needle) => normalized.includes(needle));
};

type YouthQuotaRow = QuotaRow & {
  country?: string;
  workFocus?: "Youth in Work" | "Outreach";
  cropType?: string;
  ageGroup?: "Youth" | "Adult";
};

type FarmerQuotaRow = QuotaRow & {
  country?: string;
  workFocus?: "Youth in Work" | "Outreach";
  cropType?: string;
  ageGroup?: "Youth" | "Adult";
};

type WorkCategoryCounts = {
  onFarm: number;
  agriServices: number;
  agriBusiness: number;
  trade: number;
};

const initWorkCategoryCounts = (): WorkCategoryCounts => ({
  onFarm: 0,
  agriServices: 0,
  agriBusiness: 0,
  trade: 0,
});

const matchesAgeGroup = (submission: YouthData | FarmerData, row: YouthQuotaRow | FarmerQuotaRow) => {
  if (!row.ageGroup) return true;

  const ageNum = Number((submission as YouthData).D3 ?? (submission as FarmerData).d6);
  if (Number.isNaN(ageNum)) return false;

  if (row.ageGroup === "Youth") return isYouthAge(ageNum);
  if (row.ageGroup === "Adult") return isAdultAge(ageNum);

  return true;
};

const matchesWorkFocus = (
  submission: YouthData | FarmerData,
  row: YouthQuotaRow | FarmerQuotaRow
) => {
  if (!row.workFocus) return true;

  const workVal = toLower((submission as YouthData).work);

  if (row.workFocus === "Youth in Work") {
    return workVal === "yes";
  }

  if (row.workFocus === "Outreach") {
    return workVal === "no";
  }

  return true;
};

const matchesCropType = (submission: YouthData | FarmerData, row: YouthQuotaRow | FarmerQuotaRow) => {
  if (!row.cropType) return true;
  const crop = toLower((submission as YouthData).DB19 ?? (submission as FarmerData).DB19);
  return crop === toLower(row.cropType);
};

const isYouthSubmissionVulnerable = (submission: YouthData, row: YouthQuotaRow) => {
  if (row.workFocus === "Outreach") {
    return toLower(submission.disability) === "yes";
  }

  if (row.workFocus === "Youth in Work") {
    const e12Num = Number(submission.E12);
    if (Number.isNaN(e12Num)) return false;
    return e12Num !== 7 && e12Num !== 8;
  }

  return false;
};

const addWorkCategory = (submission: YouthData, counts: WorkCategoryCounts) => {
  const val = toLower(submission.RS3);

  if (!val) return;

  if (val === "on-farm" || val === "on farm") {
    counts.onFarm += 1;
  } else if (val === "agri-services" || val === "agri services") {
    counts.agriServices += 1;
  } else if (val === "agri-business" || val === "agribusiness" || val === "agri business") {
    counts.agriBusiness += 1;
  } else if (val === "trade") {
    counts.trade += 1;
  }
};

const matchesYouthRow = (submission: YouthData, row: YouthQuotaRow, countryFilter: string) => {
  const submissionCountry = getSubmissionCountry(submission);

  if (countryFilter.toLowerCase() !== "all") {
    if (toLower(submissionCountry) !== toLower(countryFilter)) return false;
  }

  if (row.country && toLower(row.country) !== toLower(submissionCountry || "")) {
    return false;
  }

  if (toLower(row.region) !== toLower(submission.region)) return false;
  if (toLower(row.district ?? "") !== toLower(submission.district)) return false;

  if (!matchesWorkFocus(submission, row)) return false;
  if (!matchesAgeGroup(submission, row)) return false;
  if (!matchesCropType(submission, row)) return false;

  return true;
};

const outreachActivityMetrics: QuotaMetricKey[] = [
  "accessToFinance",
  "agroDealerTraining",
  "incubationBds",
  "marketLinkages",
  "trainingInternship",
  "internship",
  "extensionEvent",
  "onFarmCsaTraining",
  "entrepreneurshipTraining",
  "mentorshipSupport",
  "grainAggregation",
  "marketing",
  "seedsDistribution",
  "agriBusinessOutreach",
  "caaOrientation",
  "salesIncrease",
  "fieldExchangeDemo",
  "others",
  "extension",
  "training",
];

const evaluateYouthMetric = (
  metric: QuotaMetricKey,
  submission: YouthData,
  row: YouthQuotaRow
) => {
  const genderCode = Number(submission.D4);
  const ageNum = Number(submission.D3);

  switch (metric) {
    case "male":
      return genderCode === 1
        ? 1
        : toLower(submission.gender) === "male"
          ? 1
          : 0;
    case "female":
      return genderCode === 2
        ? 1
        : toLower(submission.gender) === "female"
          ? 1
          : 0;
    case "youth":
      return Number.isFinite(ageNum) ? (isYouthAge(ageNum) ? 1 : 0) : isYouthAgeGroupLabel(submission.ageGroup) ? 1 : 0;
    case "adult":
      return Number.isFinite(ageNum) ? (isAdultAge(ageNum) ? 1 : 0) : isYouthAgeGroupLabel(submission.ageGroup) ? 0 : 1;
    case "vulnerable":
      return isYouthSubmissionVulnerable(submission, row) ? 1 : 0;
    case "onFarm":
    case "agriService":
    case "agriBusiness":
    case "trade":
      return 0; // handled separately via work category counts
    case "total":
      return 1;
    default: {
      if (outreachActivityMetrics.includes(metric)) {
        const activities = Array.isArray(submission.outreachActivities) ? submission.outreachActivities.map(toLower) : [];
        return activities.includes(toLower(metric));
      }

      return 0;
    }
  }
};

const matchesFarmerRow = (submission: FarmerData, row: FarmerQuotaRow, countryFilter: string) => {
  const submissionCountry = getSubmissionCountry(submission);

  if (countryFilter.toLowerCase() !== "all") {
    if (toLower(submissionCountry) !== toLower(countryFilter)) return false;
  }

  if (row.country && toLower(row.country) !== toLower(submissionCountry || "")) return false;

  const regionValue = submission.db11 || submission.region;
  const districtValue = submission.db10 || submission.district;

  if (toLower(row.region) !== toLower(regionValue)) return false;
  if (toLower(row.district ?? "") !== toLower(districtValue)) return false;

  if (!matchesWorkFocus(submission, row)) return false;
  if (!matchesAgeGroup(submission, row)) return false;
  if (!matchesCropType(submission, row)) return false;

  return true;
};

const isFarmerSubmissionVulnerable = (submission: FarmerData, row: FarmerQuotaRow) => {
  if (row.workFocus === "Outreach") {
    return toLower(submission.disability) === "yes";
  }

  const value = submission.DB8;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const normalized = toLower(value);
  return normalized === "yes" || normalized === "y" || normalized === "1";
};

const evaluateFarmerMetric = (metric: QuotaMetricKey, submission: FarmerData, row: FarmerQuotaRow) => {
  const genderCode = Number(submission.D10);
  const ageNum = Number(submission.d6);
  const crop = toLower(submission.DB19 ?? submission.cropType);

  switch (metric) {
    case "male":
      return genderCode === 1
        ? 1
        : toLower(submission.gender) === "male"
          ? 1
          : 0;
    case "female":
      return genderCode === 2
        ? 1
        : toLower(submission.gender) === "female"
          ? 1
          : 0;
    case "adult":
      return Number.isFinite(ageNum) ? (isAdultAge(ageNum) ? 1 : 0) : isYouthAgeGroupLabel(submission.ageGroup) ? 0 : 1;
    case "youth":
    case "totalSampleYouth":
      return Number.isFinite(ageNum)
        ? isYouthAge(ageNum)
          ? 1
          : 0
        : isYouthAgeGroupLabel(submission.ageGroup)
          ? 1
          : 0;
    case "maize":
      return cropIncludes(crop, ["maize"]) ? 1 : 0;
    case "soyaBean":
      return cropIncludes(crop, ["soya", "soy"]) ? 1 : 0;
    case "riceSoyabean":
      return cropIncludes(crop, ["rice", "soya", "soyabean", "soybean", "soy"]) ? 1 : 0;
    case "groundnut":
      return cropIncludes(crop, ["groundnut", "groundnuts"]) ? 1 : 0;
    case "otherCrops":
      return crop && cropIncludes(crop, ["maize", "soya", "soy", "groundnut", "rice"]) ? 0 : crop ? 1 : 0;
    case "totalSampleCrop2":
      return cropIncludes(crop, ["rice"]) ? 1 : 0;
    case "totalSampleCrop3":
      return cropIncludes(crop, ["soya", "soy"]) ? 1 : 0;
    case "chili":
      return cropIncludes(crop, ["chili", "chilli"]) ? 1 : 0;
    case "vegetable":
      return cropIncludes(crop, ["vegetable"]) ? 1 : 0;
    case "poultry":
      return cropIncludes(crop, ["poultry"]) ? 1 : 0;
    case "vulnerable":
      return isFarmerSubmissionVulnerable(submission, row) ? 1 : 0;
    case "total":
      return 1;
    default:
      return 0;
  }
};

const buildRowKey = (row: QuotaRow) => `${toLower(row.region)}|${toLower(row.district ?? "")}`;

const computeYouthQuotaAchieved = (
  quotaRows: YouthQuotaRow[],
  submissions: YouthData[],
  countryFilter: string,
  metrics: QuotaMetricKey[],
  workFocus?: "Youth in Work" | "Outreach"
) => {
  const results = new Map<string, Partial<Record<QuotaMetricKey, number>>>();

  quotaRows.forEach((row) => {
    const rowWithFocus: YouthQuotaRow = {
      ...row,
      country: row.country ?? (countryFilter === "all" ? undefined : countryFilter),
      workFocus: row.workFocus ?? workFocus,
    };

    const safeSubmissions = submissions ?? [];
    const matching = safeSubmissions.filter((submission) => matchesYouthRow(submission, rowWithFocus, countryFilter));
    const workCounts = initWorkCategoryCounts();
    const metricTotals: Partial<Record<QuotaMetricKey, number>> = {};

    matching.forEach((submission) => {
      if (rowWithFocus.workFocus === "Youth in Work") {
        addWorkCategory(submission, workCounts);
      }

      metrics.forEach((metric) => {
        const increment = evaluateYouthMetric(metric, submission, rowWithFocus);
        metricTotals[metric] = (metricTotals[metric] || 0) + increment;
      });
    });

    // Inject work category rollups after iterating so they reflect unique counts
    metricTotals.onFarm = workCounts.onFarm;
    metricTotals.agriService = workCounts.agriServices;
    metricTotals.agriBusiness = workCounts.agriBusiness;
    metricTotals.trade = workCounts.trade;

    results.set(buildRowKey(rowWithFocus), metricTotals);
  });

  return results;
};

const computeFarmerQuotaAchieved = (
  quotaRows: FarmerQuotaRow[],
  submissions: FarmerData[],
  countryFilter: string,
  metrics: QuotaMetricKey[],
  workFocus?: "Youth in Work" | "Outreach"
) => {
  const results = new Map<string, Partial<Record<QuotaMetricKey, number>>>();

  quotaRows.forEach((row) => {
    const rowWithFocus: FarmerQuotaRow = {
      ...row,
      country: row.country ?? (countryFilter === "all" ? undefined : countryFilter),
      workFocus: row.workFocus ?? workFocus,
    };

    const safeSubmissions = submissions ?? [];
    const matching = safeSubmissions.filter((submission) => matchesFarmerRow(submission, rowWithFocus, countryFilter));
    const metricTotals: Partial<Record<QuotaMetricKey, number>> = {};

    matching.forEach((submission) => {
      metrics.forEach((metric) => {
        const increment = evaluateFarmerMetric(metric, submission, rowWithFocus);
        metricTotals[metric] = (metricTotals[metric] || 0) + increment;
      });
    });

    results.set(buildRowKey(rowWithFocus), metricTotals);
  });

  return results;
};

export function QuotaSection({
  variant,
  submissions,
  selectedCountry,
  config,
  title = "Quota Progress",
  controls,
  workFocus,
}: QuotaSectionProps) {
  const countryKeys = Object.keys(config.countries);
  const isTotalFilter = selectedCountry === "all";

  const allMetrics = useMemo(() => {
    const metricMap = new Map<QuotaMetricKey, QuotaMetric>();
    countryKeys.forEach((country) => {
      config.countries[country]?.metrics.forEach((metric) => {
        if (!metricMap.has(metric.key)) metricMap.set(metric.key, metric);
      });
    });
    return Array.from(metricMap.values());
  }, [config.countries, countryKeys]);

  const aggregatedRow = useMemo<QuotaRow>(() => {
    const totals: Partial<Record<QuotaMetricKey, number>> = {};
    countryKeys.forEach((country) => {
      config.countries[country]?.rows.forEach((row) => {
        Object.entries(row.targets).forEach(([key, value]) => {
          const metricKey = key as QuotaMetricKey;
          totals[metricKey] = (totals[metricKey] || 0) + (value || 0);
        });
      });
    });

    return {
      region: "All Regions",
      district: "Total",
      targets: totals,
    };
  }, [config.countries, countryKeys]);

  const activeConfig = useMemo(
    () =>
      isTotalFilter
        ? { metrics: allMetrics, rows: [aggregatedRow] }
        : config.countries[selectedCountry],
    [aggregatedRow, allMetrics, config.countries, isTotalFilter, selectedCountry]
  );

  const filteredSubmissions = useMemo(() => {
    const safeSubmissions = submissions ?? [];
    if (isTotalFilter) return safeSubmissions;
    return safeSubmissions.filter(
      (submission) => getSubmissionCountry(submission)?.toLowerCase() === selectedCountry.toLowerCase()
    );
  }, [isTotalFilter, selectedCountry, submissions]);

  const achievedByRow = useMemo(() => {
    if (!activeConfig) return null;

    const metrics = activeConfig.metrics.map((metric) => metric.key);

    if (variant === "youth") {
      return computeYouthQuotaAchieved(
        activeConfig.rows as YouthQuotaRow[],
        filteredSubmissions as YouthData[],
        selectedCountry,
        metrics,
        workFocus
      );
    }

    if (variant === "farmer") {
      return computeFarmerQuotaAchieved(
        activeConfig.rows as FarmerQuotaRow[],
        filteredSubmissions as FarmerData[],
        selectedCountry,
        metrics,
        workFocus
      );
    }

    return null;
  }, [activeConfig, filteredSubmissions, selectedCountry, variant, workFocus]);

  if (isTotalFilter) {
    return null;
  }

  if (!activeConfig) {
    return (
      <div className="minimal-card text-sm text-muted-foreground">No quota data found for this country.</div>
    );
  }

  return (
    <div className="minimal-card overflow-hidden">
      <div className={cn("border-b px-4 py-3", headerTone[variant])}>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide opacity-80">Quota tracking</span>
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">
            Targets remain static while achieved and balance update with the country filter.
          </span>
        </div>
        {controls ? <div className="mt-3 flex flex-wrap gap-2">{controls}</div> : null}
      </div>

      <div className="border-b border-border/60 bg-muted/10 px-4 py-3 text-sm font-semibold">
        {countryLabel(isTotalFilter ? "All Countries (Total)" : selectedCountry)}
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th
                className="border border-border/60 bg-muted/10 px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground"
                rowSpan={2}
              >
                Region
              </th>
              <th
                className="border border-border/60 bg-muted/10 px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground"
                rowSpan={2}
              >
                District
              </th>
              {activeConfig.metrics.map((metric) => (
                <th
                  key={metric.key}
                  className="border border-border/60 bg-muted/10 px-2 py-2 text-center text-xs font-semibold uppercase text-muted-foreground"
                  colSpan={3}
                >
                  {metric.label}
                </th>
              ))}
            </tr>
            <tr>
              {activeConfig.metrics.map((metric) => (
                <Fragment key={`${metric.key}-header`}>
                  <th
                    className="border border-border/60 bg-background px-2 py-1 text-center text-[11px] font-medium uppercase text-muted-foreground"
                  >
                    Target
                  </th>
                  <th
                    className="border border-border/60 bg-background px-2 py-1 text-center text-[11px] font-medium uppercase text-muted-foreground"
                  >
                    Achieved
                  </th>
                  <th
                    className="border border-border/60 bg-background px-2 py-1 text-center text-[11px] font-medium uppercase text-muted-foreground"
                  >
                    Balance
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeConfig.rows.map((row) => (
              <tr key={`${row.region}-${row.district ?? "overall"}`} className="odd:bg-muted/5">
                <td className="border border-border/60 px-3 py-2 text-foreground text-sm font-medium">
                  {row.region}
                </td>
                <td className="border border-border/60 px-3 py-2 text-foreground text-sm">
                  {row.district ?? "—"}
                </td>
                {activeConfig.metrics.map((metric) => {
                  const targetValue = row.targets[metric.key] ?? 0;
                  const achievedValue = achievedByRow?.get(buildRowKey(row))?.[metric.key] ?? 0;
                  const balance = Math.max(targetValue - achievedValue, 0);

                  return (
                    <Fragment key={`${row.region}-${row.district ?? "overall"}-${metric.key}`}>
                      <td className="border border-border/60 px-2 py-2 text-center text-foreground">
                        {targetValue.toLocaleString()}
                      </td>
                      <td className="border border-border/60 px-2 py-2 text-center text-primary font-semibold">
                        {achievedValue.toLocaleString()}
                      </td>
                      <td className="border border-border/60 px-2 py-2 text-center text-foreground">
                        {balance.toLocaleString()}
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
