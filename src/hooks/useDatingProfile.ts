
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from "@tanstack/react-query";

export function useDatingProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching dating profile for user:', userId);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('❌ Profile not found, creating new profile for user:', userId);
            setProfile(null);
          } else {
            throw error;
          }
        } else {
          console.log('✅ Dating profile loaded:', data);
          setProfile(data);
        }
      } catch (err: any) {
        console.error('❌ Error fetching dating profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    // Set up realtime subscription for profile changes
    const channel = supabase
      .channel(`dating-profile-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        console.log('🔄 Dating profile realtime update:', payload);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setProfile(payload.new);
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: ["dating-profile", userId] });
          queryClient.invalidateQueries({ queryKey: ["unified-profile", userId] }); 
          queryClient.invalidateQueries({ queryKey: ["nearby-profiles"] });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const updateProfile = async (updates: any) => {
    if (!userId) {
      console.error('❌ No userId provided for profile update');
      return;
    }

    try {
      console.log('🔄 Updating dating profile:', updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          last_active: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating dating profile:', error);
        throw error;
      }
      
      console.log('✅ Dating profile updated successfully:', data);
      setProfile(data);
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["dating-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["unified-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["nearby-profiles"] });
      
      return data;
    } catch (err: any) {
      console.error('❌ Error updating dating profile:', err);
      throw err;
    }
  };

  const updateLocation = async (lat: number, lng: number, locationName?: string) => {
    if (!userId) {
      console.error('❌ No userId provided for location update');
      return;
    }

    try {
      console.log('🔄 Updating profile location:', { lat, lng, locationName });
      
      const updates: any = { 
        lat, 
        lng, 
        last_active: new Date().toISOString() 
      };
      if (locationName) updates.location_name = locationName;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating location:', error);
        throw error;
      }
      
      console.log('✅ Profile location updated successfully:', data);
      setProfile(data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["dating-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["unified-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["nearby-profiles"] });
      
      return data;
    } catch (err: any) {
      console.error('❌ Error updating location:', err);
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
        console.log('🔄 Manually refreshing dating profile');
        setLoading(true);
        queryClient.invalidateQueries({ queryKey: ["dating-profile", userId] });
      }
    }
  };
}
