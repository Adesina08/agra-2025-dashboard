export type Variant = 'farmer' | 'enterprise' | 'youth';

export const headerTone: Record<Variant, string> = {
  farmer: 'bg-farmer/10 border-farmer/40 text-farmer',
  enterprise: 'bg-enterprise/10 border-enterprise/40 text-enterprise',
  youth: 'bg-youth/10 border-youth/40 text-youth',
};

export const tabToneActive: Record<Variant, string> = {
  farmer: 'bg-farmer text-foreground border-farmer shadow-sm',
  enterprise: 'bg-enterprise text-foreground border-enterprise shadow-sm',
  youth: 'bg-youth text-foreground border-youth shadow-sm',
};

export const tabToneInactive =
  'bg-transparent text-muted-foreground border-transparent hover:bg-muted/40';
