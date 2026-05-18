/**
 * V8-M9 beta setup foundation.
 *
 * For beta, each company profile is preconfigured in code so AI-CAS can run without a
 * backend admin system. In Beta 1/post-beta this will move to editable admin-managed setup.
 */
export type BetaCompanySetupProfile = {
  companyName: string;
  primaryBetaContactEmail: string;
  engineeringRoutingEmail: string;
  purchasingRoutingEmail: string;
  supervisorProductionRoutingEmail: string;
  qualityRoutingEmail: string;
  defaultFallbackRoutingEmail: string;
  departmentOptions: string[];
  operationEquipmentOptions: string[];
  correctionOrderBucketLabels: {
    engineering: string;
    purchasing: string;
    supervisorProduction: string;
    quality: string;
  };
};

export const DEFAULT_BETA_COMPANY_SETUP_PROFILE: BetaCompanySetupProfile = {
  companyName: 'AI-CAS Beta Company',
  primaryBetaContactEmail: 'beta-contact@example.com',
  engineeringRoutingEmail: 'engineering@example.com',
  purchasingRoutingEmail: 'purchasing@example.com',
  supervisorProductionRoutingEmail: 'supervisor-production@example.com',
  qualityRoutingEmail: 'quality@example.com',
  defaultFallbackRoutingEmail: 'routing-fallback@example.com',
  departmentOptions: [
    'Engineering / Router',
    'Purchasing / Material Control',
    'Supervisor / Production',
    'Quality',
    'Welding',
    'Laser / Cutting',
    'Machining',
    'Forming',
    'PEM / Hardware Insertion',
    'Assembly',
    'Powder Coat / Outside Processing',
  ],
  operationEquipmentOptions: [
    'Welding',
    'Laser / Cutting',
    'CNC Machining',
    'Forming',
    'PEM / Hardware Insertion',
    'Assembly',
    'Powder Coat / Outside Processing',
    'Other / Needs Review',
  ],
  correctionOrderBucketLabels: {
    engineering: 'Engineering Correction Order',
    purchasing: 'Purchasing Correction Order',
    supervisorProduction: 'Supervisor / Production Correction Order',
    quality: 'Quality Correction Order',
  },
};
