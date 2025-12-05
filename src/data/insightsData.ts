// Insights data types and mock data

export interface InsightsData {
  youth: {
    byAgeGroup: { label: string; value: number }[];
    byGender: { label: string; value: number }[];
    byEducation: { label: string; value: number }[];
    employmentType: { label: string; value: number }[];
    interestInAgriculture: { label: string; value: number }[];
    programmeParticipationFunnel: { stage: string; value: number }[];
    satisfactionScores: { score: number; count: number }[];
  };

  enterprises: {
    byBusinessType: { label: string; value: number }[];
    operationalStatus: { label: string; value: number }[];
    digitalAdoption: { label: string; value: number }[];
    investmentsLast12Months: { label: string; value: number }[];
    mainMarket: { label: string; value: number }[];
    establishmentByYear: { year: number; count: number }[];
  };

  farmers: {
    cropsCultivated: { crop: string; households: number }[];
    practicesAdoption: { practice: string; adoptionRate: number }[];
    landSizeVsCrops: { landSize: number; cropCount: number }[];
    rainfallStartMonth: { month: string; households: number }[];
    rainfallPerception: { label: string; value: number }[];
    shockExposure: { type: string; value: number }[];
  };
}

export const insightsData: InsightsData = {
  youth: {
    byAgeGroup: [
      { label: '18-21', value: 245 },
      { label: '22-25', value: 312 },
      { label: '26-29', value: 198 },
      { label: '30-35', value: 135 },
    ],
    byGender: [
      { label: 'Male', value: 485 },
      { label: 'Female', value: 405 },
    ],
    byEducation: [
      { label: 'Primary', value: 89 },
      { label: 'Secondary', value: 267 },
      { label: 'Diploma', value: 234 },
      { label: 'Bachelor', value: 245 },
      { label: 'Masters', value: 55 },
    ],
    employmentType: [
      { label: 'Farming', value: 234 },
      { label: 'Agri-Services', value: 189 },
      { label: 'Off-farm Ag', value: 156 },
      { label: 'Off-farm Non-Ag', value: 311 },
    ],
    interestInAgriculture: [
      { label: 'Interested', value: 678 },
      { label: 'Not Interested', value: 212 },
    ],
    programmeParticipationFunnel: [
      { stage: 'Reached', value: 890 },
      { stage: 'Enrolled', value: 654 },
      { stage: 'Active', value: 423 },
      { stage: 'Completed', value: 287 },
    ],
    satisfactionScores: [
      { score: 1, count: 23 },
      { score: 2, count: 45 },
      { score: 3, count: 156 },
      { score: 4, count: 298 },
      { score: 5, count: 368 },
    ],
  },

  enterprises: {
    byBusinessType: [
      { label: 'Seed Sales', value: 78 },
      { label: 'Processing', value: 112 },
      { label: 'Mechanization', value: 56 },
      { label: 'Agro-dealer', value: 89 },
      { label: 'Transport', value: 67 },
      { label: 'Storage', value: 45 },
      { label: 'Retail', value: 33 },
    ],
    operationalStatus: [
      { label: 'Fully Operational', value: 312 },
      { label: 'Reduced Scale', value: 98 },
      { label: 'Temporarily Closed', value: 45 },
      { label: 'Permanently Closed', value: 25 },
    ],
    digitalAdoption: [
      { label: 'None', value: 89 },
      { label: 'Low', value: 145 },
      { label: 'Medium', value: 156 },
      { label: 'High', value: 90 },
    ],
    investmentsLast12Months: [
      { label: 'Land', value: 123 },
      { label: 'Buildings', value: 89 },
      { label: 'Equipment', value: 234 },
      { label: 'R&D', value: 67 },
      { label: 'Training', value: 156 },
      { label: 'Working Capital', value: 289 },
    ],
    mainMarket: [
      { label: 'Local', value: 189 },
      { label: 'Regional', value: 156 },
      { label: 'National', value: 98 },
      { label: 'International', value: 37 },
    ],
    establishmentByYear: [
      { year: 2018, count: 23 },
      { year: 2019, count: 45 },
      { year: 2020, count: 67 },
      { year: 2021, count: 89 },
      { year: 2022, count: 112 },
      { year: 2023, count: 98 },
      { year: 2024, count: 46 },
    ],
  },

  farmers: {
    cropsCultivated: [
      { crop: 'Maize', households: 456 },
      { crop: 'Wheat', households: 234 },
      { crop: 'Rice', households: 189 },
      { crop: 'Beans', households: 312 },
      { crop: 'Coffee', households: 145 },
      { crop: 'Tea', households: 98 },
      { crop: 'Sugarcane', households: 67 },
      { crop: 'Cassava', households: 134 },
    ],
    practicesAdoption: [
      { practice: 'Manure Application', adoptionRate: 72 },
      { practice: 'Mulching', adoptionRate: 56 },
      { practice: 'Crop Rotation', adoptionRate: 68 },
      { practice: 'Irrigation', adoptionRate: 34 },
      { practice: 'Improved Seeds', adoptionRate: 78 },
      { practice: 'Pest Control', adoptionRate: 62 },
    ],
    landSizeVsCrops: [
      { landSize: 0.5, cropCount: 1 },
      { landSize: 1, cropCount: 2 },
      { landSize: 1.5, cropCount: 2 },
      { landSize: 2, cropCount: 3 },
      { landSize: 3, cropCount: 3 },
      { landSize: 4, cropCount: 4 },
      { landSize: 5, cropCount: 4 },
      { landSize: 7, cropCount: 5 },
      { landSize: 10, cropCount: 6 },
    ],
    rainfallStartMonth: [
      { month: 'Jan', households: 23 },
      { month: 'Feb', households: 45 },
      { month: 'Mar', households: 312 },
      { month: 'Apr', households: 456 },
      { month: 'May', households: 234 },
      { month: 'Jun', households: 89 },
      { month: 'Jul', households: 45 },
      { month: 'Aug', households: 23 },
      { month: 'Sep', households: 12 },
      { month: 'Oct', households: 67 },
      { month: 'Nov', households: 145 },
      { month: 'Dec', households: 89 },
    ],
    rainfallPerception: [
      { label: 'Much Less', value: 89 },
      { label: 'Less', value: 234 },
      { label: 'Average', value: 456 },
      { label: 'More', value: 312 },
      { label: 'Much More', value: 159 },
    ],
    shockExposure: [
      { type: 'Drought', value: 423 },
      { type: 'Flood', value: 156 },
      { type: 'Dry Spells', value: 367 },
      { type: 'Pests', value: 289 },
      { type: 'Disease', value: 198 },
    ],
  },
};

// KPI calculations
export function calculateYouthKpis(data: InsightsData['youth']) {
  const total = data.byGender.reduce((sum, g) => sum + g.value, 0);
  const engagedInAg = data.employmentType
    .filter(e => e.label !== 'Off-farm Non-Ag')
    .reduce((sum, e) => sum + e.value, 0);
  const avgSatisfaction = data.satisfactionScores.reduce((sum, s) => sum + s.score * s.count, 0) / 
    data.satisfactionScores.reduce((sum, s) => sum + s.count, 0);
  
  return {
    total,
    engagedPercent: ((engagedInAg / total) * 100).toFixed(1),
    avgSatisfaction: avgSatisfaction.toFixed(1),
    completionRate: ((data.programmeParticipationFunnel[3].value / data.programmeParticipationFunnel[0].value) * 100).toFixed(1),
  };
}

export function calculateEnterpriseKpis(data: InsightsData['enterprises']) {
  const total = data.operationalStatus.reduce((sum, s) => sum + s.value, 0);
  const operational = data.operationalStatus.find(s => s.label === 'Fully Operational')?.value || 0;
  const digitalUsers = data.digitalAdoption
    .filter(d => d.label !== 'None')
    .reduce((sum, d) => sum + d.value, 0);
  
  return {
    total,
    operationalPercent: ((operational / total) * 100).toFixed(1),
    digitalAdoptionPercent: ((digitalUsers / total) * 100).toFixed(1),
    avgInvestments: (data.investmentsLast12Months.reduce((sum, i) => sum + i.value, 0) / data.investmentsLast12Months.length).toFixed(0),
  };
}

export function calculateFarmerKpis(data: InsightsData['farmers']) {
  const totalHouseholds = data.cropsCultivated.reduce((sum, c) => sum + c.households, 0);
  const avgAdoption = data.practicesAdoption.reduce((sum, p) => sum + p.adoptionRate, 0) / data.practicesAdoption.length;
  const shockAffected = data.shockExposure.reduce((sum, s) => sum + s.value, 0);
  
  return {
    totalHouseholds,
    avgPracticeAdoption: avgAdoption.toFixed(1),
    topCrop: data.cropsCultivated.sort((a, b) => b.households - a.households)[0].crop,
    shockExposureRate: ((shockAffected / totalHouseholds) * 100).toFixed(1),
  };
}
