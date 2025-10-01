
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { getDatingRequiresPremium, setDatingRequiresPremium } = useAdminSettings();

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

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="dating-premium-toggle" className="font-semibold text-purple-800">
                  Yêu cầu Premium cho Hẹn hò
                </Label>
                <p className="text-sm text-purple-600 mt-1">
                  Khi tắt, tất cả người dùng có thể sử dụng tính năng Hẹn hò không giới hạn
                </p>
              </div>
              <Switch
                id="dating-premium-toggle"
                checked={getDatingRequiresPremium()}
                onCheckedChange={(checked) => setDatingRequiresPremium(checked)}
              />
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
