const chartHeaderVariants = {
  farmer: 'from-farmer to-farmer-secondary',
  enterprise: 'from-enterprise to-enterprise-secondary',
  youth: 'from-youth to-youth-secondary',
};

export function getChartHeaderClasses(variant: 'farmer' | 'enterprise' | 'youth' = 'farmer') {
  return `bg-gradient-to-r ${chartHeaderVariants[variant]} text-white`;
}
