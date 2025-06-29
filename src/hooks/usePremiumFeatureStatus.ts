
import { useState, useEffect } from 'react';

export function usePremiumFeatureStatus() {
  const [premiumDatingEnabled, setPremiumDatingEnabled] = useState(true);
  const [premiumNearbyEnabled, setPremiumNearbyEnabled] = useState(true);

  useEffect(() => {
    // Check localStorage for admin settings
    const datingEnabled = localStorage.getItem('premiumDatingEnabled');
    const nearbyEnabled = localStorage.getItem('premiumNearbyEnabled');
    
    setPremiumDatingEnabled(datingEnabled !== 'false');
    setPremiumNearbyEnabled(nearbyEnabled !== 'false');

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => {
      const datingEnabled = localStorage.getItem('premiumDatingEnabled');
      const nearbyEnabled = localStorage.getItem('premiumNearbyEnabled');
      
      setPremiumDatingEnabled(datingEnabled !== 'false');
      setPremiumNearbyEnabled(nearbyEnabled !== 'false');
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    premiumDatingEnabled,
    premiumNearbyEnabled
  };
}
