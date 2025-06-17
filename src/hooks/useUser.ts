
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔐 useUser: Setting up auth state listener...');
    setIsAuthLoading(true);
    
    // Get current user session
    const getCurrentUser = async () => {
      try {
        console.log('🔍 useUser: Getting current session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ useUser: Session error:', error);
          setAuthError(error.message);
        } else {
          console.log('✅ useUser: Session retrieved:', session?.user?.id || 'no user');
          setUserId(session?.user?.id || null);
          setAuthError(null);
        }
      } catch (error: any) {
        console.error('💥 useUser: Exception getting session:', error);
        setAuthError(error.message || 'Failed to get session');
        setUserId(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 useUser: Auth state changed:', event, session?.user?.id || 'no user');
      setUserId(session?.user?.id || null);
      setAuthError(null);
      setIsAuthLoading(false);
    });

    return () => {
      console.log('🧹 useUser: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const { data: user, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["user-profile", userId],
    enabled: !!userId && !isAuthLoading,
    queryFn: async () => {
      if (!userId) return null;

      console.log('👤 useUser: Fetching profile for user:', userId);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.error('❌ useUser: Profile query error:', error);
          
          // If profile doesn't exist, create a fallback profile
          if (error.code === 'PGRST116') {
            console.log('⚠️ useUser: Profile not found, creating fallback...');
            
            // Get user email from auth
            const { data: { user: authUser } } = await supabase.auth.getUser();
            
            const fallbackProfile = {
              id: userId,
              name: authUser?.email?.split('@')[0] || 'User',
              age: 25,
              gender: 'other',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              bio: 'Xin chào! Tôi đang tìm kiếm những kết nối ý nghĩa.',
              interests: [],
              album: [],
              height: 170,
              job: null,
              education: null,
              location_name: null,
              lat: null,
              lng: null,
              is_dating_active: true,
              last_active: new Date().toISOString(),
              created_at: new Date().toISOString(),
              tai_khoan_hoat_dong: true,
              dating_preferences: {
                age_range: { min: 18, max: 35 },
                distance: 50,
                gender_preference: 'all'
              }
            };
            
            console.log('✅ useUser: Using fallback profile');
            return fallbackProfile;
          }
          
          throw error;
        }

        console.log('✅ useUser: Profile loaded successfully:', data?.name);
        return data;
      } catch (error: any) {
        console.error('💥 useUser: Exception fetching profile:', error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const isLoading = isAuthLoading || profileLoading;
  const error = authError || profileError?.message;

  console.log('📊 useUser: Current state:', {
    userId,
    isAuthLoading,
    profileLoading,
    hasUser: !!user,
    hasError: !!error,
    isAuthenticated: !!userId
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!userId,
    error,
    userId
  };
}
