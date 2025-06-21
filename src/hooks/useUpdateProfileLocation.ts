
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook dùng để cập nhật vị trí GPS của user lên bảng profiles duy nhất khi position thay đổi.
 */
export function useUpdateProfileLocation(userId: string | undefined, position: { lat: number, lng: number } | null) {
  useEffect(() => {
    if (!userId || !position) return;
    
    async function updateLocation() {
      try {
        // Cập nhật profile với thông tin vị trí mới vào bảng profiles duy nhất
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            lat: position.lat,
            lng: position.lng,
            last_active: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (error) {
          console.error('Error updating location:', error);
        } else {
          console.log('Location updated successfully for user:', userId);
        }
      } catch (err) {
        console.error('Error in updateLocation:', err);
      }
    }
    
    updateLocation();
  }, [position, userId]);
}
