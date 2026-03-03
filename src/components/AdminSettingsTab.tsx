
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BankInfoManager from "./BankInfoManager";
import HeaderAdManager from "./HeaderAdManager";
import { useBankInfo } from "@/hooks/useBankInfo";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminSettingsTab() {
  const [qrImgUploading, setQrImgUploading] = useState(false);
  const { toast } = useToast();
  const { bankInfo, loading, refetch } = useBankInfo();
  const { 
    getDatingRequiresPremium, 
    setDatingRequiresPremium,
    getChatFilterEnabled,
    setChatFilterEnabled,
    getNearbyRequiresPremium,
    setNearbyRequiresPremium,
    isLoading: settingsLoading
  } = useAdminSettings();

  // Local state for bank info draft
  const [bankInfoDraft, setBankInfoDraft] = useState(bankInfo);

  // Sync bank info when it changes
  React.useEffect(() => {
    setBankInfoDraft(bankInfo);
  }, [bankInfo]);

  // Header ad code state
  const [headerAdCode, setHeaderAdCode] = useState(
    localStorage.getItem('headerAdCode') || ''
  );

  // Settings state (removed OpenAI API key - now stored in Supabase secrets)
  const [settings, setSettings] = useState({
    chatTimeout: 60,
    aiMatchRate: 30,
    searchRadius: 5
  });

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setQrImgUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 2bf31122a9f7095'
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.success) {
        setBankInfoDraft(prev => ({ ...prev, qrUrl: data.data.link }));
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Lỗi tải ảnh",
        description: "Không thể tải ảnh QR lên. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setQrImgUploading(false);
    }
  };

  const saveBankInfo = async () => {
    const { error } = await supabase
      .from("bank_info")
      .upsert([
        {
          id: 1,
          bank_name: bankInfoDraft.bankName,
          account_number: bankInfoDraft.accountNumber,
          account_holder: bankInfoDraft.accountHolder,
          qr_url: bankInfoDraft.qrUrl,
        },
      ]);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu thông tin ngân hàng",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã lưu thông tin ngân hàng & QR"
      });
      refetch();
    }
  };

  const handleSaveHeaderAdCode = () => {
    localStorage.setItem('headerAdCode', headerAdCode);
    toast({
      title: "Thành công",
      description: "Đã lưu mã quảng cáo header"
    });
  };

  const handleSaveSettings = () => {
    localStorage.setItem('datingAppSettings', JSON.stringify(settings));
    toast({
      title: "Thành công", 
      description: "Đã lưu cài đặt hệ thống"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tính năng Dating</CardTitle>
          <CardDescription>Quản lý quyền truy cập các tính năng Dating</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Thanh toán tự động</h3>
            <p className="text-sm text-blue-600">
              Hệ thống đã tích hợp PayOS để xử lý thanh toán tự động. 
              Không cần duyệt thủ công nữa.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="dating-premium-toggle" className="flex-1">
              <div className="space-y-1">
                <div>Yêu cầu Premium cho Hẹn hò</div>
                <div className="text-sm text-muted-foreground">
                  Khi tắt, tất cả người dùng có thể sử dụng tính năng Hẹn hò không giới hạn
                </div>
              </div>
            </Label>
            <Switch
              id="dating-premium-toggle"
              checked={getDatingRequiresPremium()}
              onCheckedChange={(checked) => setDatingRequiresPremium(checked)}
              disabled={settingsLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tính năng Quanh đây</CardTitle>
          <CardDescription>Quản lý quyền truy cập Premium cho tính năng Quanh đây</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="nearby-premium-toggle" className="flex-1">
              <div className="space-y-1">
                <div>Yêu cầu Premium cho Quanh đây</div>
                <div className="text-sm text-muted-foreground">
                  Khi tắt, tất cả người dùng có thể sử dụng phạm vi 20km và ẩn banner Premium
                </div>
              </div>
            </Label>
            <Switch
              id="nearby-premium-toggle"
              checked={getNearbyRequiresPremium()}
              onCheckedChange={(checked) => setNearbyRequiresPremium(checked)}
              disabled={settingsLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tính năng Chat</CardTitle>
          <CardDescription>Quản lý hiển thị danh sách tin nhắn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="chat-filter-toggle" className="flex-1">
              <div className="space-y-1">
                <div>Bật giới hạn tin nhắn cho người dùng Free</div>
                <div className="text-sm text-muted-foreground">
                  Khi bật, người dùng Free chỉ xem được 5 cuộc hội thoại đầu tiên
                </div>
              </div>
            </Label>
            <Switch
              id="chat-filter-toggle"
              checked={getChatFilterEnabled()}
              onCheckedChange={(checked) => setChatFilterEnabled(checked)}
              disabled={settingsLoading}
            />
          </div>
        </CardContent>
      </Card>

      <HeaderAdManager
        headerAdCode={headerAdCode}
        setHeaderAdCode={setHeaderAdCode}
        onSave={handleSaveHeaderAdCode}
      />

      <BankInfoManager
        bankInfo={bankInfoDraft}
        setBankInfo={setBankInfoDraft}
        onSave={saveBankInfo}
        qrImgUploading={qrImgUploading}
        onQrUpload={handleQrUpload}
      />

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt Hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔒 Bảo mật OpenAI API</h3>
            <p className="text-sm text-blue-600">
              OpenAI API key được lưu an toàn trong Supabase Secrets. 
              Vui lòng liên hệ developer để cập nhật key.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Thời gian chờ chat (giây)</label>
            <input
              type="number"
              value={settings.chatTimeout}
              onChange={e => setSettings(prev => ({ ...prev, chatTimeout: parseInt(e.target.value) }))}
              className="w-full p-2 rounded border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tỷ lệ AI match (%)</label>
            <input
              type="number"
              value={settings.aiMatchRate}
              onChange={e => setSettings(prev => ({ ...prev, aiMatchRate: parseInt(e.target.value) }))}
              className="w-full p-2 rounded border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bán kính tìm kiếm (km)</label>
            <input
              type="number"
              value={settings.searchRadius}
              onChange={e => setSettings(prev => ({ ...prev, searchRadius: parseInt(e.target.value) }))}
              className="w-full p-2 rounded border"
            />
          </div>
          <Button onClick={handleSaveSettings} variant="secondary">
            Lưu cài đặt hệ thống
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
