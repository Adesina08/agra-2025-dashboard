export type QuotaMetricKey =
  | "male"
  | "female"
  | "adult"
  | "youth"
  | "riceSoyabean"
  | "maize"
  | "soyaBean"
  | "groundnut"
  | "otherCrops"
  | "vulnerable"
  | "total"
  | "totalSampleYouth"
  | "totalSampleCrop2"
  | "totalSampleCrop3"
  | "chili"
  | "vegetable"
  | "poultry";

export interface QuotaMetric {
  key: QuotaMetricKey;
  label: string;
}

export interface QuotaRow {
  region: string;
  district?: string;
  targets: Partial<Record<QuotaMetricKey, number>>;
}

export interface SegmentQuotaConfig {
  countries: Record<
    string,
    {
      metrics: QuotaMetric[];
      rows: QuotaRow[];
    }
  >;
}

export const farmerQuotaConfig: SegmentQuotaConfig = {
  countries: {
    Ghana: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "adult", label: "Adult" },
        { key: "youth", label: "Youth" },
        { key: "riceSoyabean", label: "Rice & Soyabean" },
      ],
      rows: [
        {
          region: "North East Region",
          district: "East Mamprusi",
          targets: {
            male: 0,
            female: 24,
            adult: 11,
            youth: 14,
            riceSoyabean: 24,
          },
        },
        {
          region: "North East Region",
          district: "Mampurugu-Moagduri",
          targets: {
            male: 21,
            female: 35,
            adult: 27,
            youth: 28,
            riceSoyabean: 55,
          },
        },
        {
          region: "Northern Region",
          district: "Gushegu Municipal District",
          targets: {
            male: 20,
            female: 90,
            adult: 27,
            youth: 53,
            riceSoyabean: 58,
          },
        },
        {
          region: "Northern Region",
          district: "Nanumba south",
          targets: {
            male: 94,
            female: 117,
            adult: 102,
            youth: 138,
            riceSoyabean: 229,
          },
        },
      ],
    },
    Malawi: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "adult", label: "Adult" },
        { key: "youth", label: "Youth" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "maize", label: "Maize" },
        { key: "soyaBean", label: "Soya Bean" },
        { key: "groundnut", label: "Groundnut" },
        { key: "otherCrops", label: "Other Crops" },
      ],
      rows: [
        {
          region: "Central Region",
          district: "Dowa",
          targets: {
            male: 53,
            female: 60,
            adult: 76,
            youth: 37,
            vulnerable: 2,
            maize: 87,
            soyaBean: 3,
            groundnut: 0,
            otherCrops: 23,
          },
        },
        {
          region: "Central Region",
          district: "Lilongwe",
          targets: {
            male: 107,
            female: 145,
            adult: 112,
            youth: 140,
            vulnerable: 2,
            maize: 135,
            soyaBean: 0,
            groundnut: 0,
            otherCrops: 117,
          },
        },
        {
          region: "Southern Region",
          district: "Zomba",
          targets: {
            male: 7,
            female: 20,
            adult: 8,
            youth: 19,
            vulnerable: 1,
            maize: 12,
            soyaBean: 121,
            groundnut: 2,
            otherCrops: 0,
          },
        },
        {
          region: "Southern Region",
          district: "Machinga",
          targets: {
            male: 2,
            female: 6,
            adult: 4,
            youth: 4,
            vulnerable: 0,
            maize: 7,
            soyaBean: 0,
            groundnut: 1,
            otherCrops: 1,
          },
        },
        {
          region: "Malawi",
          district: "Total",
          targets: {
            male: 170,
            female: 230,
            adult: 200,
            youth: 200,
            vulnerable: 5,
            maize: 241,
            soyaBean: 124,
            groundnut: 4,
            otherCrops: 141,
          },
        },
      ],
    },
    Mozambique: {
      metrics: [
        { key: "total", label: "Total" },
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "adult", label: "Adult" },
        { key: "totalSampleYouth", label: "Total sample size_youth" },
        { key: "totalSampleCrop2", label: "Total sample size-crop-2 (Rice)" },
        { key: "totalSampleCrop3", label: "Total sample size-crop-3 (Soya)" },
      ],
      rows: [
        {
          region: "Nampula",
          district: "Nampula",
          targets: {
            total: 200,
            male: 169,
            female: 31,
            adult: 2,
            totalSampleYouth: 198,
            totalSampleCrop2: 0,
            totalSampleCrop3: 1,
          },
        },
        {
          region: "Niassa",
          district: "Niassa",
          targets: {
            total: 120,
            male: 0,
            female: 120,
            adult: 0,
            totalSampleYouth: 120,
            totalSampleCrop2: 0,
            totalSampleCrop3: 120,
          },
        },
        {
          region: "Sofala",
          district: "Sofala",
          targets: {
            total: 80,
            male: 52,
            female: 28,
            adult: 3,
            totalSampleYouth: 77,
            totalSampleCrop2: 79,
            totalSampleCrop3: 0,
          },
        },
      ],
    },
    Rwanda: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "adult", label: "Adult" },
        { key: "youth", label: "Youth" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "chili", label: "Chili" },
        { key: "maize", label: "Maize" },
        { key: "vegetable", label: "Vegetable" },
        { key: "poultry", label: "Poultry" },
      ],
      rows: [
        {
          region: "Eastern Region",
          district: "Bugesera",
          targets: {
            male: 65,
            female: 126,
            adult: 187,
            youth: 4,
            vulnerable: 0,
            chili: 105,
            maize: 82,
            vegetable: 3,
            poultry: 0,
          },
        },
        {
          region: "Eastern Region",
          district: "Gatsibo",
          targets: {
            male: 67,
            female: 45,
            adult: 106,
            youth: 5,
            vulnerable: 1,
            chili: 16,
            maize: 90,
            vegetable: 0,
            poultry: 2,
          },
        },
        {
          region: "Eastern Region",
          district: "Kayonza",
          targets: {
            male: 14,
            female: 68,
            adult: 83,
            youth: 1,
            vulnerable: 0,
            chili: 85,
            maize: 0,
            vegetable: 0,
            poultry: 1,
          },
        },
        {
          region: "Eastern Region",
          district: "Rwamagana",
          targets: {
            male: 7,
            female: 7,
            adult: 11,
            youth: 3,
            vulnerable: 0,
            chili: 15,
            maize: 0,
            vegetable: 0,
            poultry: 0,
          },
        },
      ],
    },
    Tanzania: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "adult", label: "Adult" },
        { key: "youth", label: "Youth" },
        { key: "maize", label: "Maize" },
      ],
      rows: [
        {
          region: "Kigoma Region",
          district: "Kasulu",
          targets: {
            male: 58,
            female: 49,
            adult: 77,
            youth: 30,
            maize: 0,
          },
        },
        {
          region: "Kigoma Region",
          district: "Kakonko",
          targets: {
            male: 32,
            female: 26,
            adult: 38,
            youth: 20,
            maize: 0,
          },
        },
        {
          region: "Kigoma Region",
          district: "Uvinza",
          targets: {
            male: 30,
            female: 23,
            adult: 38,
            youth: 15,
            maize: 0,
          },
        },
        {
          region: "Katavi Region",
          district: "Nsimbo",
          targets: {
            male: 52,
            female: 32,
            adult: 61,
            youth: 22,
            maize: 14,
          },
        },
        {
          region: "Katavi Region",
          district: "Tanganyika",
          targets: {
            male: 16,
            female: 10,
            adult: 20,
            youth: 6,
            maize: 4,
          },
        },
        {
          region: "Mbeya Region",
          district: "Kyela",
          targets: {
            male: 42,
            female: 30,
            adult: 56,
            youth: 16,
            maize: 0,
          },
        },
        {
          region: "Tanzania",
          district: "Overall",
          targets: {
            male: 120,
            female: 98,
            adult: 153,
            youth: 65,
            maize: 1,
          },
        },
      ],
    },
  },
};

const sharedQuotaMetrics: QuotaMetric[] = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "youth", label: "Youth" },
  { key: "adult", label: "Adult" },
  { key: "total", label: "Total" },
];

const starterRows = (region: string, total: number): QuotaRow => ({
  region,
  district: "Overall",
  targets: {
    male: Math.round(total * 0.45),
    female: Math.round(total * 0.55),
    youth: Math.round(total * 0.6),
    adult: Math.round(total * 0.4),
    total,
  },
});

export const youthQuotaConfig: SegmentQuotaConfig = {
  countries: {
    Ghana: { metrics: sharedQuotaMetrics, rows: [starterRows("Ghana", 420)] },
    Malawi: { metrics: sharedQuotaMetrics, rows: [starterRows("Malawi", 360)] },
    Mozambique: { metrics: sharedQuotaMetrics, rows: [starterRows("Mozambique", 310)] },
    Rwanda: { metrics: sharedQuotaMetrics, rows: [starterRows("Rwanda", 280)] },
    Tanzania: { metrics: sharedQuotaMetrics, rows: [starterRows("Tanzania", 330)] },
  },
};
