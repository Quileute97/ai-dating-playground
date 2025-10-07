import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  avatar: string | null;
  lat: number | null;
  lng: number | null;
  gender?: string | null;
  bio?: string | null;
  interests?: any;
  height?: number | null;
  job?: string | null;
  education?: string | null;
  location_name?: string | null;
  is_dating_active?: boolean;
  last_active?: string | null;
  distance?: number;
}

export function useNearbyProfiles(currentUserId: string | undefined, userLocation: { lat: number, lng: number } | null, maxDistanceKm: number = 5) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    // Function to calculate distance (Haversine formula)
    function distance(lat1: number, lng1: number, lat2: number, lng2: number) {
      const R = 6371; // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    async function fetchNearby() {
      // Lấy cả real users và fake users
      const { data: realUsers, error: realError } = await supabase
        .from("profiles")
        .select("id, name, age, avatar, lat, lng, gender, bio, interests, height, job, education, location_name, is_dating_active, last_active")
        .eq('tai_khoan_hoat_dong', true)
        .eq('is_dating_active', true);

      const { data: fakeUsers, error: fakeError } = await supabase
        .from("fake_users")
        .select("id, name, age, avatar, lat, lng, gender, bio, interests, height, job, education, location_name, is_dating_active, last_active")
        .eq('is_active', true)
        .eq('is_dating_active', true);

      if (realError || fakeError) {
        console.error('Error fetching nearby profiles:', realError || fakeError);
        setProfiles([]);
        setLoading(false);
        return;
      }

      // Combine real and fake users
      const allUsers = [
        ...(realUsers || []).map(u => ({ ...u, user_type: 'real' })),
        ...(fakeUsers || []).map(u => ({ ...u, user_type: 'fake' }))
      ];

      // Loại trừ user hiện tại và tính khoảng cách nếu có vị trí
      let filtered = (allUsers as (Profile & { user_type: string })[])
        .filter((u) => u.id !== currentUserId)
        .map((u) => {
          // Tính khoảng cách nếu cả user và profile đều có vị trí
          if (userLocation && u.lat !== null && u.lng !== null) {
            return {
              ...u,
              distance: distance(userLocation.lat, userLocation.lng, u.lat, u.lng)
            };
          }
          return { ...u, distance: undefined };
        });

      // Sắp xếp: profiles có khoảng cách lên trước, sau đó theo khoảng cách
      filtered.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        if (a.distance !== undefined) return -1;
        if (b.distance !== undefined) return 1;
        return 0;
      });

      setProfiles(filtered);
      setLoading(false);
    }

    fetchNearby();
  }, [userLocation, currentUserId, maxDistanceKm]);

  return { profiles, loading };
}