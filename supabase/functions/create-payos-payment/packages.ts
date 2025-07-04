
import { PackageDetails } from './types.ts';

export const getPackageDetails = (packageType: string): PackageDetails | null => {
  const packages: Record<string, PackageDetails> = {
    // Dating packages
    'dating_week': {
      amount: 49000,
      description: 'Premium 1 Tuan',
      duration: 7
    },
    'dating_month': {
      amount: 149000,
      description: 'Premium 1 Thang',
      duration: 30
    },
    'dating_unlimited': {
      amount: 399000,
      description: 'Premium Vinh Vien',
      duration: -1
    },
    
    // Nearby packages
    'nearby': {
      amount: 99000,
      description: 'Goi Gan Day',
      duration: 30
    },
    
    // Gold packages
    'gold': {
      amount: 199000,
      description: 'Goi Gold',
      duration: 30
    },
    
    // Premium packages
    'premium_monthly': {
      amount: 99000,
      description: 'Premium Hang Thang',
      duration: 30
    },
    'premium_yearly': {
      amount: 999000,
      description: 'Premium Hang Nam',
      duration: 365
    }
  };

  return packages[packageType] || null;
};
