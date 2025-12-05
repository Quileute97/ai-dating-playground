
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useCheckExpiredSubscriptions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-expired-subscriptions');
      
      if (error) {
        throw new Error(error.message || 'Failed to check expired subscriptions');
      }
      
      return data;
    },
    onSuccess: (data) => {
      if (data.updatedCount > 0) {
        toast({
          title: "Đã cập nhật trạng thái gói",
          description: `${data.updatedCount} gói đã hết hạn đã được cập nhật`,
        });
        
        // Invalidate subscription queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ["dating-subscription"] });
        queryClient.invalidateQueries({ queryKey: ["nearby-subscription"] });
      }
    },
    onError: (error) => {
      console.error('Check expired subscriptions error:', error);
      toast({
        title: "Lỗi kiểm tra gói hết hạn",
        description: error.message || "Không thể kiểm tra trạng thái gói",
        variant: "destructive"
      });
    }
  });
}
