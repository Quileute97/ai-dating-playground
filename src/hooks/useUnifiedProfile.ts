
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnifiedProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Profile doesn't exist, will be created by trigger
            setProfile(null);
          } else {
            throw error;
          }
        } else {
          setProfile(data);
        }
      } catch (err: any) {
        console.error('Error fetching unified profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates: any) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          last_active: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating unified profile:', err);
      throw err;
    }
  };

  const updateLocation = async (lat: number, lng: number, locationName?: string) => {
    if (!userId) return;

    try {
      const updates: any = { lat, lng, last_active: new Date().toISOString() };
      if (locationName) updates.location_name = locationName;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error updating location:', err);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateLocation,
    refreshProfile: () => {
      if (userId) {
        setLoading(true);
      }
    }
  };
}
