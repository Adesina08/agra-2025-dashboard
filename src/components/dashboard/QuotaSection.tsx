import { useMemo, Fragment } from "react";
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
}

const countryLabel = (country: string) => country || "All Countries";

const youthAgeGroups = ["15-35", "15-25", "18-25", "26-35", "Youth"];

const isYouthAge = (ageGroup?: string) => {
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

const metricEvaluators: Record<QuotaMetricKey, (submission: SubmissionLike) => number> = {
  male: (submission) => (submission.gender?.toLowerCase() === "male" ? 1 : 0),
  female: (submission) => (submission.gender?.toLowerCase() === "female" ? 1 : 0),
  adult: (submission) => (!isYouthAge(submission.ageGroup) ? 1 : 0),
  youth: (submission) => (isYouthAge((submission as FarmerData | YouthData).ageGroup) ? 1 : 0),
  riceSoyabean: (submission) =>
    cropIncludes((submission as FarmerData).cropType, ["rice", "soya", "soyabean", "soybean"]) ? 1 : 0,
  maize: (submission) => (cropIncludes((submission as FarmerData).cropType, ["maize"]) ? 1 : 0),
  soyaBean: (submission) => (cropIncludes((submission as FarmerData).cropType, ["soya", "soy"]) ? 1 : 0),
  groundnut: (submission) => (cropIncludes((submission as FarmerData).cropType, ["groundnut"]) ? 1 : 0),
  otherCrops: (submission) => {
    const crop = (submission as FarmerData).cropType?.toLowerCase();
    if (!crop) return 0;
    if (cropIncludes(crop, ["maize", "soya", "soy", "groundnut", "rice"])) return 0;
    return 1;
  },
  vulnerable: (submission) => (((submission as FarmerData) as any).vulnerable ? 1 : 0),
  total: () => 1,
  totalSampleYouth: (submission) => (isYouthAge((submission as FarmerData | YouthData).ageGroup) ? 1 : 0),
  totalSampleCrop2: (submission) => (cropIncludes((submission as FarmerData).cropType, ["rice"]) ? 1 : 0),
  totalSampleCrop3: (submission) => (cropIncludes((submission as FarmerData).cropType, ["soya", "soy"]) ? 1 : 0),
  chili: (submission) => (cropIncludes((submission as FarmerData).cropType, ["chili", "chilli"]) ? 1 : 0),
  vegetable: (submission) => (cropIncludes((submission as FarmerData).cropType, ["vegetable"]) ? 1 : 0),
  poultry: (submission) => (cropIncludes((submission as FarmerData).cropType, ["poultry"]) ? 1 : 0),
};

function countAchieved(
  submissions: SubmissionLike[],
  row: QuotaRow,
  metric: QuotaMetricKey,
  country?: string
) {
  return submissions.reduce((sum, submission) => {
    const matchesCountry = country
      ? submission.country?.toLowerCase() === country.toLowerCase()
      : true;
    if (!matchesCountry) return sum;

    const matchesRegion = row.region
      ? submission.region?.toLowerCase() === row.region.toLowerCase()
      : true;
    const matchesDistrict = row.district
      ? submission.district?.toLowerCase() === row.district.toLowerCase()
      : true;

    if (!matchesRegion || !matchesDistrict) return sum;

    const evaluator = metricEvaluators[metric];
    return evaluator ? sum + evaluator(submission) : sum;
  }, 0);
}

export function QuotaSection({
  variant,
  submissions,
  selectedCountry,
  config,
  title = "Quota Progress",
}: QuotaSectionProps) {
  const countryKeys = Object.keys(config.countries);

  const countriesToShow = useMemo(() => {
    if (selectedCountry === "all") return countryKeys;
    return countryKeys.includes(selectedCountry) ? [selectedCountry] : [];
  }, [countryKeys, selectedCountry]);

  if (!countriesToShow.length) {
    return (
      <div className="minimal-card text-sm text-muted-foreground">No quota data found for this country.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={cn("rounded-xl px-4 py-3 border", headerTone[variant])}>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide opacity-80">Quota tracking</span>
          <span className="text-sm font-semibold">{title}</span>
          <span className="text-xs text-muted-foreground">
            Targets remain static while achieved and balance update with the country filter.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {countriesToShow.map((country) => {
          const countryConfig = config.countries[country];
          const headers = countryConfig?.metrics ?? [];
          const countrySubmissions = submissions.filter(
            (submission) => submission.country?.toLowerCase() === country.toLowerCase()
          );

          return (
            <div key={country} className="minimal-card overflow-hidden">
              <div className="border-b border-border/60 bg-muted/10 px-4 py-3 text-sm font-semibold">
                {countryLabel(country)}
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
                      {headers.map((metric) => (
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
                      {headers.map((metric) => (
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
                    {countryConfig.rows.map((row) => (
                      <tr key={`${row.region}-${row.district ?? "overall"}`} className="odd:bg-muted/5">
                        <td className="border border-border/60 px-3 py-2 text-foreground text-sm font-medium">
                          {row.region}
                        </td>
                        <td className="border border-border/60 px-3 py-2 text-foreground text-sm">
                          {row.district ?? "—"}
                        </td>
                        {headers.map((metric) => {
                          const targetValue = row.targets[metric.key] ?? 0;
                          const achievedValue = countAchieved(
                            countrySubmissions,
                            row,
                            metric.key,
                            country
                          );
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
        })}
      </div>
    </div>
  );
}
