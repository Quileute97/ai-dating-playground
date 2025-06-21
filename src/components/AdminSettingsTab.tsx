
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BankInfoManager from "./BankInfoManager";
import { useBankInfo } from "@/hooks/useBankInfo";

export default function AdminSettingsTab() {
  const [qrImgUploading, setQrImgUploading] = useState(false);
  const { toast } = useToast();
  const { bankInfo, setBankInfo, refetch } = useBankInfo();

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
        setBankInfo(prev => ({ ...prev, qrUrl: data.data.link }));
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
          bank_name: bankInfo.bankName,
          account_number: bankInfo.accountNumber,
          account_holder: bankInfo.accountHolder,
          qr_url: bankInfo.qrUrl,
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
          </div>
        </CardContent>
      </Card>

      <BankInfoManager
        bankInfo={bankInfo}
        setBankInfo={setBankInfo}
        onSave={saveBankInfo}
        qrImgUploading={qrImgUploading}
        onQrUpload={handleQrUpload}
      />
    </div>
  );
}
