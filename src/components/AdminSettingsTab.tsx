
import React from "react";
import HeaderAdManager from "./HeaderAdManager";
import BankInfoManager from "./BankInfoManager";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface Props {
  headerAdCode: string;
  setHeaderAdCode: (v: string) => void;
  onSaveHeaderAd: () => void;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrUrl: string;
  };
  setBankInfo: (u: any) => void;
  onSaveBankInfo: () => void;
  qrImgUploading: boolean;
  onQrUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  settings: any;
  setSettings: (u: any) => void;
  handleSaveSettings: () => void;
}

const AdminSettingsTab: React.FC<Props> = ({
  headerAdCode, setHeaderAdCode, onSaveHeaderAd,
  bankInfo, setBankInfo, onSaveBankInfo,
  qrImgUploading, onQrUpload,
  settings, setSettings,
  handleSaveSettings,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">Cài đặt hệ thống</h2>
      <Button
        onClick={handleSaveSettings}
        className="bg-gradient-to-r from-green-500 to-blue-500"
      >
        <Save className="w-4 h-4 mr-2" />
        Lưu cài đặt
      </Button>
    </div>
    <div className="grid gap-6">
      <HeaderAdManager
        headerAdCode={headerAdCode}
        setHeaderAdCode={setHeaderAdCode}
        onSave={onSaveHeaderAd}
      />
      <BankInfoManager
        bankInfo={bankInfo}
        setBankInfo={setBankInfo}
        onSave={onSaveBankInfo}
        qrImgUploading={qrImgUploading}
        onQrUpload={onQrUpload}
      />
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API Key OpenAI</label>
            <input
              type="password"
              placeholder="sk-..."
              value={settings.openaiApiKey}
              onChange={(e) => setSettings((prev: any) => ({ ...prev, openaiApiKey: e.target.value }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Timeout chat (giây)</label>
            <input
              type="number"
              value={settings.chatTimeout}
              onChange={(e) => setSettings((prev: any) => ({ ...prev, chatTimeout: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt matching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tỉ lệ match với AI (%)</label>
            <input
              type="number"
              value={settings.aiMatchRate}
              onChange={(e) => setSettings((prev: any) => ({ ...prev, aiMatchRate: parseInt(e.target.value) }))}
              min="0"
              max="100"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phạm vi tìm kiếm mặc định (km)</label>
            <input
              type="number"
              value={settings.searchRadius}
              onChange={(e) => setSettings((prev: any) => ({ ...prev, searchRadius: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default AdminSettingsTab;
