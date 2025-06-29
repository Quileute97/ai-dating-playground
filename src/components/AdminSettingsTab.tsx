
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BankInfoManager from "./BankInfoManager";
import HeaderAdManager from "./HeaderAdManager";
import { useBankInfo } from "@/hooks/useBankInfo";

export default function AdminSettingsTab() {
  const [qrImgUploading, setQrImgUploading] = useState(false);
  const { toast } = useToast();
  const { bankInfo, loading, refetch } = useBankInfo();

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

  // Premium feature toggles
  const [premiumDatingEnabled, setPremiumDatingEnabled] = useState(
    localStorage.getItem('premiumDatingEnabled') === 'true'
  );
  const [premiumNearbyEnabled, setPremiumNearbyEnabled] = useState(
    localStorage.getItem('premiumNearbyEnabled') === 'true'
  );

  // Settings state
  const [settings, setSettings] = useState({
    openaiApiKey: '',
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

  const handleTogglePremiumDating = (enabled: boolean) => {
    setPremiumDatingEnabled(enabled);
    localStorage.setItem('premiumDatingEnabled', enabled.toString());
    toast({
      title: enabled ? "Đã bật Premium Hẹn Hò" : "Đã tắt Premium Hẹn Hò",
      description: enabled ? "Người dùng có thể mua gói Premium Hẹn Hò" : "Tính năng Premium Hẹn Hò đã bị vô hiệu hóa"
    });
  };

  const handleTogglePremiumNearby = (enabled: boolean) => {
    setPremiumNearbyEnabled(enabled);
    localStorage.setItem('premiumNearbyEnabled', enabled.toString());
    toast({
      title: enabled ? "Đã bật Premium Quanh Đây" : "Đã tắt Premium Quanh Đây",
      description: enabled ? "Người dùng có thể mua gói Premium Quanh Đây" : "Tính năng Premium Quanh Đây đã bị vô hiệu hóa"
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
          <CardTitle>Quản lý tính năng Premium</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800">Premium Hẹn Hò</h3>
              <p className="text-sm text-gray-600">
                Cho phép người dùng mua gói Premium để có không giới hạn lượt match và các tính năng đặc biệt
              </p>
            </div>
            <Switch
              checked={premiumDatingEnabled}
              onCheckedChange={handleTogglePremiumDating}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800">Premium Quanh Đây</h3>
              <p className="text-sm text-gray-600">
                Cho phép người dùng mua gói Premium để xem người dùng quanh đây và chat không giới hạn
              </p>
            </div>
            <Switch
              checked={premiumNearbyEnabled}
              onCheckedChange={handleTogglePremiumNearby}
            />
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Lưu ý</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>• Khi tắt tính năng Premium, người dùng sẽ không thể mua gói mới</li>
              <li>• Các gói Premium đã mua vẫn hoạt động bình thường cho đến khi hết hạn</li>
              <li>• Cài đặt này áp dụng cho toàn bộ hệ thống</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Thanh toán tự động</h3>
              <p className="text-sm text-blue-600">
                Hệ thống đã tích hợp PayOS để xử lý thanh toán tự động. 
                Không cần duyệt thủ công nữa.
              </p>
            </div>
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
          <CardTitle>Cài đặt AI & Hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
            <input
              type="password"
              value={settings.openaiApiKey}
              onChange={e => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
              className="w-full p-2 rounded border"
              placeholder="sk-..."
            />
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
