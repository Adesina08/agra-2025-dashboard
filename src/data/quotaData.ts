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
  | "poultry"
  | "onFarm"
  | "agriService"
  | "agriBusiness"
  | "trade"
  | "extension"
  | "training"
  | "accessToFinance"
  | "agroDealerTraining"
  | "incubationBds"
  | "marketLinkages"
  | "trainingInternship"
  | "internship"
  | "extensionEvent"
  | "onFarmCsaTraining"
  | "entrepreneurshipTraining"
  | "mentorshipSupport"
  | "grainAggregation"
  | "marketing"
  | "seedsDistribution"
  | "agriBusinessOutreach"
  | "caaOrientation"
  | "salesIncrease"
  | "fieldExchangeDemo"
  | "others";

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

export const youthInWorkQuotaConfig: SegmentQuotaConfig = {
  countries: {
    Tanzania: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "onFarm", label: "On-Farm" },
        { key: "agriService", label: "Agri-Service" },
        { key: "agriBusiness", label: "Agri-Business" },
        { key: "trade", label: "Trade" },
      ],
      rows: [
        {
          region: "Kigoma Region",
          district: "Uvinza",
          targets: { male: 36, female: 43, vulnerable: 0, onFarm: 48, agriService: 0, agriBusiness: 21, trade: 11 },
        },
        {
          region: "Kigoma Region",
          district: "Kibondo",
          targets: { male: 8, female: 9, vulnerable: 2, onFarm: 11, agriService: 0, agriBusiness: 3, trade: 2 },
        },
        {
          region: "Kigoma Region",
          district: "Mpimbwe",
          targets: { male: 23, female: 21, vulnerable: 0, onFarm: 36, agriService: 0, agriBusiness: 9, trade: 0 },
        },
        {
          region: "Katavi Region",
          district: "Nsimbo",
          targets: { male: 10, female: 19, vulnerable: 0, onFarm: 24, agriService: 0, agriBusiness: 5, trade: 0 },
        },
        {
          region: "Katavi Region",
          district: "MPANDA",
          targets: { male: 17, female: 13, vulnerable: 0, onFarm: 14, agriService: 2, agriBusiness: 14, trade: 0 },
        },
        {
          region: "Katavi Region",
          district: "Total",
          targets: { male: 50, female: 53, vulnerable: 0, onFarm: 74, agriService: 2, agriBusiness: 28, trade: 0 },
        },
      ],
    },
    Rwanda: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "onFarm", label: "On-Farm" },
        { key: "agriService", label: "Agri-Services" },
        { key: "agriBusiness", label: "Agri-Business" },
        { key: "trade", label: "Trade" },
      ],
      rows: [
        {
          region: "Eastern Region",
          district: "Bugesera",
          targets: { male: 17, female: 25, vulnerable: 0, onFarm: 34, agriService: 4, agriBusiness: 3, trade: 1 },
        },
        {
          region: "Eastern Region",
          district: "Gatsibo",
          targets: { male: 23, female: 34, vulnerable: 1, onFarm: 49, agriService: 2, agriBusiness: 3, trade: 4 },
        },
        {
          region: "Eastern Region",
          district: "Kayonza",
          targets: { male: 19, female: 29, vulnerable: 1, onFarm: 44, agriService: 1, agriBusiness: 4, trade: 0 },
        },
        {
          region: "Eastern Region",
          district: "Rwamagana",
          targets: { male: 17, female: 35, vulnerable: 1, onFarm: 46, agriService: 1, agriBusiness: 2, trade: 2 },
        },
      ],
    },
    Mozambique: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "onFarm", label: "On-Farm" },
        { key: "extension", label: "Extension" },
        { key: "training", label: "Training" },
      ],
      rows: [
        {
          region: "Nampula Region",
          district: "Ribáuè",
          targets: { male: 28, female: 46, onFarm: 74, extension: 17, training: 31 },
        },
        {
          region: "Sofala Region",
          district: "Meconta",
          targets: { male: 37, female: 21, onFarm: 57, extension: 57, training: 0 },
        },
        {
          region: "Sofala Region",
          district: "Gorongosa",
          targets: { male: 19, female: 16, onFarm: 35, extension: 35, training: 0 },
        },
        {
          region: "Sofala Region",
          district: "Nhamatanda",
          targets: { male: 14, female: 19, onFarm: 33, extension: 29, training: 0 },
        },
      ],
    },
    Malawi: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "onFarm", label: "On-Farm" },
        { key: "agriService", label: "Agri-Services" },
        { key: "agriBusiness", label: "Agri-Business" },
        { key: "accessToFinance", label: "Access to Finance" },
        { key: "agroDealerTraining", label: "Agro-Dealer Training" },
        { key: "incubationBds", label: "Incubation-Business Development Service" },
        { key: "marketLinkages", label: "Market Linkages" },
      ],
      rows: [
        {
          region: "Central Region",
          district: "Lilongwe",
          targets: {
            male: 42,
            female: 49,
            vulnerable: 1,
            onFarm: 90,
            agriService: 0,
            agriBusiness: 1,
            accessToFinance: 1,
            agroDealerTraining: 0,
            incubationBds: 0,
            marketLinkages: 88,
          },
        },
        {
          region: "Southern Region",
          district: "Kasungu",
          targets: {
            male: 15,
            female: 23,
            vulnerable: 2,
            onFarm: 36,
            agriService: 0,
            agriBusiness: 0,
            accessToFinance: 0,
            agroDealerTraining: 0,
            incubationBds: 0,
            marketLinkages: 38,
          },
        },
        {
          region: "Southern Region",
          district: "Dowa",
          targets: {
            male: 28,
            female: 28,
            vulnerable: 6,
            onFarm: 57,
            agriService: 0,
            agriBusiness: 0,
            accessToFinance: 0,
            agroDealerTraining: 0,
            incubationBds: 0,
            marketLinkages: 57,
          },
        },
        {
          region: "Southern Region",
          district: "Zomba",
          targets: {
            male: 11,
            female: 4,
            vulnerable: 0,
            onFarm: 3,
            agriService: 4,
            agriBusiness: 8,
            accessToFinance: 0,
            agroDealerTraining: 11,
            incubationBds: 17,
            marketLinkages: 0,
          },
        },
      ],
    },
    Ghana: {
      metrics: [
        { key: "total", label: "Total" },
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "onFarm", label: "On-Farm" },
        { key: "agriService", label: "Agri-Service" },
        { key: "agriBusiness", label: "Agri-Business" },
      ],
      rows: [
        {
          region: "Northern Region",
          district: "Sagnarigu",
          targets: { total: 40, male: 17, female: 23, onFarm: 13, agriService: 0, agriBusiness: 27 },
        },
        {
          region: "Northern Region",
          district: "Yendi",
          targets: { total: 46, male: 18, female: 28, onFarm: 27, agriService: 0, agriBusiness: 19 },
        },
        {
          region: "Northern Region",
          district: "Mion",
          targets: { total: 79, male: 39, female: 40, onFarm: 4, agriService: 74, agriBusiness: 1 },
        },
        {
          region: "Northern Region",
          district: "Tamale",
          targets: { total: 34, male: 16, female: 18, onFarm: 16, agriService: 0, agriBusiness: 18 },
        },
        {
          region: "Northern Region",
          district: "Total",
          targets: { total: 200, male: 90, female: 110, onFarm: 60, agriService: 74, agriBusiness: 65 },
        },
      ],
    },
  },
};

export const youthOutreachQuotaConfig: SegmentQuotaConfig = {
  countries: {
    Tanzania: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "extensionEvent", label: "Extension Event" },
        { key: "onFarmCsaTraining", label: "On-Farm CSA Training" },
        { key: "entrepreneurshipTraining", label: "Entrepreneurship Training" },
        { key: "mentorshipSupport", label: "Mentorship & Extension Support" },
        { key: "accessToFinance", label: "Access to Finance" },
        { key: "grainAggregation", label: "Grain Aggregation" },
        { key: "internship", label: "Internship" },
        { key: "marketing", label: "Marketing" },
        { key: "seedsDistribution", label: "Seeds/Seedling Distribution" },
        { key: "training", label: "Training" },
      ],
      rows: [
        {
          region: "Kigoma Region",
          district: "Uvinza",
          targets: {
            male: 30,
            female: 43,
            vulnerable: 0,
            extensionEvent: 0,
            onFarmCsaTraining: 0,
            entrepreneurshipTraining: 0,
            mentorshipSupport: 2,
            accessToFinance: 3,
            grainAggregation: 2,
            internship: 2,
            marketing: 2,
            seedsDistribution: 2,
            training: 0,
          },
        },
        {
          region: "Kigoma Region",
          district: "Kibondo",
          targets: {
            male: 19,
            female: 21,
            vulnerable: 1,
            extensionEvent: 0,
            onFarmCsaTraining: 0,
            entrepreneurshipTraining: 62,
            mentorshipSupport: 10,
            accessToFinance: 1,
            grainAggregation: 0,
            internship: 0,
            marketing: 0,
            seedsDistribution: 0,
            training: 0,
          },
        },
        {
          region: "Katavi Region",
          district: "Mpimbwe",
          targets: {
            male: 18,
            female: 23,
            vulnerable: 0,
            extensionEvent: 6,
            onFarmCsaTraining: 0,
            entrepreneurshipTraining: 0,
            mentorshipSupport: 0,
            accessToFinance: 0,
            grainAggregation: 0,
            internship: 0,
            marketing: 0,
            seedsDistribution: 0,
            training: 0,
          },
        },
        {
          region: "Katavi Region",
          district: "Nsimbo",
          targets: {
            male: 16,
            female: 15,
            vulnerable: 0,
            extensionEvent: 8,
            onFarmCsaTraining: 0,
            entrepreneurshipTraining: 0,
            mentorshipSupport: 0,
            accessToFinance: 0,
            grainAggregation: 0,
            internship: 0,
            marketing: 0,
            seedsDistribution: 0,
            training: 0,
          },
        },
        {
          region: "Katavi Region",
          district: "MPANDA",
          targets: {
            male: 8,
            female: 7,
            vulnerable: 0,
            extensionEvent: 23,
            onFarmCsaTraining: 0,
            entrepreneurshipTraining: 0,
            mentorshipSupport: 0,
            accessToFinance: 0,
            grainAggregation: 0,
            internship: 0,
            marketing: 0,
            seedsDistribution: 0,
            training: 0,
          },
        },
      ],
    },
    Rwanda: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "trainingInternship", label: "Training / Internship" },
        { key: "internship", label: "Internship" },
        { key: "accessToFinance", label: "Access to Finance" },
        { key: "salesIncrease", label: "Increase Crop & Poultry Sales" },
        { key: "fieldExchangeDemo", label: "Field Exchange Demo" },
        { key: "seedsDistribution", label: "Seeds/Seedling Distribution" },
        { key: "extensionEvent", label: "Extension Event" },
        { key: "training", label: "Training" },
        { key: "others", label: "Others" },
      ],
      rows: [
        {
          region: "Eastern Region",
          district: "Bugesera",
          targets: {
            male: 15,
            female: 21,
            vulnerable: 0.12 as number,
            trainingInternship: 0,
            internship: 0,
            accessToFinance: 0,
            salesIncrease: 0,
            fieldExchangeDemo: 0,
            seedsDistribution: 8,
            extensionEvent: 2,
            training: 17,
            others: 7,
          },
        },
        {
          region: "Eastern Region",
          district: "Gatsibo",
          targets: {
            male: 27,
            female: 31,
            vulnerable: 0.19 as number,
            trainingInternship: 0,
            internship: 0,
            accessToFinance: 1,
            salesIncrease: 0,
            fieldExchangeDemo: 8,
            seedsDistribution: 0,
            extensionEvent: 0,
            training: 47,
            others: 0,
          },
        },
        {
          region: "Eastern Region",
          district: "Kayonza",
          targets: {
            male: 12,
            female: 22,
            vulnerable: 0.22 as number,
            trainingInternship: 0,
            internship: 1,
            accessToFinance: 1,
            salesIncrease: 2,
            fieldExchangeDemo: 1,
            seedsDistribution: 0,
            extensionEvent: 23,
            training: 5,
            others: 5,
          },
        },
        {
          region: "Eastern Region",
          district: "Rwamagana",
          targets: {
            male: 28,
            female: 44,
            vulnerable: 0.35 as number,
            trainingInternship: 0,
            internship: 0,
            accessToFinance: 1,
            salesIncrease: 1,
            fieldExchangeDemo: 1,
            seedsDistribution: 2,
            extensionEvent: 66,
            training: 0,
            others: 0,
          },
        },
      ],
    },
    Mozambique: {
      metrics: [
        { key: "total", label: "Total" },
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "extensionEvent", label: "Extension Event" },
        { key: "training", label: "Training" },
        { key: "seedsDistribution", label: "Seeds/Seedling Distribution" },
        { key: "marketing", label: "Marketing" },
        { key: "accessToFinance", label: "Access to Finance" },
        { key: "grainAggregation", label: "Grain Aggregation" },
      ],
      rows: [
        {
          region: "Nampula Region",
          district: "Ribáuè",
          targets: { total: 70, male: 31, female: 39, extensionEvent: 29, training: 19, seedsDistribution: 37, marketing: 1, accessToFinance: 1, grainAggregation: 2 },
        },
        {
          region: "Nampula Region",
          district: "Meconta",
          targets: { total: 23, male: 11, female: 12, extensionEvent: 22, training: 0.3 as number, seedsDistribution: 0, marketing: 0, accessToFinance: 0, grainAggregation: 0 },
        },
        {
          region: "Sofala Region",
          district: "Gorongosa",
          targets: { total: 60, male: 31, female: 29, extensionEvent: 60, training: 0, seedsDistribution: 0, marketing: 0, accessToFinance: 0, grainAggregation: 0 },
        },
        {
          region: "Sofala Region",
          district: "Nhamatanda",
          targets: { total: 47, male: 21, female: 26, extensionEvent: 16, training: 0, seedsDistribution: 0, marketing: 0, accessToFinance: 0, grainAggregation: 0 },
        },
      ],
    },
    Malawi: {
      metrics: [
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
        { key: "vulnerable", label: "Vulnerable" },
        { key: "onFarm", label: "On-Farm" },
        { key: "agriBusinessOutreach", label: "Agri Business" },
        { key: "caaOrientation", label: "CAA Orientation" },
        { key: "incubationBds", label: "Incubation-Business Development Service" },
        { key: "marketLinkages", label: "Market Linkages" },
      ],
      rows: [
        {
          region: "Central Region",
          district: "Lilongwe",
          targets: { male: 49, female: 65, vulnerable: 5, onFarm: 113, agriBusinessOutreach: 1, caaOrientation: 0, incubationBds: 1, marketLinkages: 113 },
        },
        {
          region: "Central Region",
          district: "Kasungu",
          targets: { male: 22, female: 27, vulnerable: 7, onFarm: 49, agriBusinessOutreach: 0, caaOrientation: 0, incubationBds: 0, marketLinkages: 48 },
        },
        {
          region: "Central Region",
          district: "Dowa",
          targets: { male: 11, female: 12, vulnerable: 4, onFarm: 22, agriBusinessOutreach: 1, caaOrientation: 0, incubationBds: 1, marketLinkages: 22 },
        },
        {
          region: "Southern Region",
          district: "Zomba",
          targets: { male: 3, female: 12, vulnerable: 0, onFarm: 0, agriBusinessOutreach: 0, caaOrientation: 15, incubationBds: 15, marketLinkages: 0 },
        },
      ],
    },
    Ghana: {
      metrics: [
        { key: "total", label: "Total" },
        { key: "male", label: "Male" },
        { key: "female", label: "Female" },
      ],
      rows: [
        { region: "Upper East Region", district: "Talensi", targets: { total: 36, male: 10, female: 26 } },
        { region: "Upper East Region", district: "Bongo", targets: { total: 41, male: 3, female: 39 } },
        { region: "Upper East Region", district: "Nabdam", targets: { total: 123, male: 19, female: 104 } },
        { region: "Upper East Region", district: "Total", targets: { total: 200, male: 31, female: 169 } },
      ],
    },
  },
};
