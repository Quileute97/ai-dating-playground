import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_at?: string;
}

export function useAdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*");

      if (error) throw error;
      return data as AdminSetting[];
    },
    staleTime: 30 * 1000,
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data, error } = await supabase
        .from("admin_settings")
        .update({ setting_value: value })
        .eq("setting_key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast({
        title: "Cập nhật thành công",
        description: "Cài đặt đã được cập nhật",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string) => {
    return settings?.find((s) => s.setting_key === key);
  };

  const getDatingRequiresPremium = () => {
    const setting = getSetting("dating_requires_premium");
    return setting?.setting_value?.enabled ?? true;
  };

  const setDatingRequiresPremium = (enabled: boolean) => {
    updateSettingMutation.mutate({
      key: "dating_requires_premium",
      value: { enabled },
    });
  };

  const getChatFilterEnabled = () => {
    const setting = getSetting("chat_filter_enabled");
    return setting?.setting_value?.enabled ?? true;
  };

  const setChatFilterEnabled = (enabled: boolean) => {
    updateSettingMutation.mutate({
      key: "chat_filter_enabled",
      value: { enabled },
    });
  };

  return {
    settings,
    isLoading,
    getSetting,
    getDatingRequiresPremium,
    setDatingRequiresPremium,
    getChatFilterEnabled,
    setChatFilterEnabled,
    updateSetting: updateSettingMutation.mutate,
  };
}
