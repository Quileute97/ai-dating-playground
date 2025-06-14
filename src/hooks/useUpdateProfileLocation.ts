
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook dùng để cập nhật vị trí GPS của user lên Supabase khi position thay đổi.
 */
export function useUpdateProfileLocation(userId: string | undefined, position: { lat: number, lng: number } | null) {
  useEffect(() => {
    if (!userId || !position) return;
    // Gọi Supabase để update, nếu profile chưa có sẽ insert mới
    async function updateLocation() {
      // Upsert profile (add nếu chưa có, update nếu đã có)
      await supabase.from("profiles").upsert({
        id: userId,
        lat: position.lat,
        lng: position.lng,
      });
    }
    updateLocation();
  }, [position, userId]);
}
