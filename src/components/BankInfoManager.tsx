
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrUrl: string;
}
interface BankInfoManagerProps {
  bankInfo: BankInfo;
  setBankInfo: React.Dispatch<React.SetStateAction<BankInfo>>;
  onSave: () => void;
  qrImgUploading: boolean;
  onQrUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BankInfoManager: React.FC<BankInfoManagerProps> = ({
  bankInfo,
  setBankInfo,
  onSave,
  qrImgUploading,
  onQrUpload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tài khoản ngân hàng &amp; QR nâng cấp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm mb-1 font-medium">Ngân hàng</label>
          <input
            className="w-full p-2 rounded border"
            value={bankInfo.bankName}
            onChange={e =>
              setBankInfo(bi => ({ ...bi, bankName: e.target.value }))
            }
            placeholder="Ví dụ: Vietcombank"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Số tài khoản</label>
          <input
            className="w-full p-2 rounded border"
            value={bankInfo.accountNumber}
            onChange={e =>
              setBankInfo(bi => ({ ...bi, accountNumber: e.target.value }))
            }
            placeholder="Ví dụ: 0123456789"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Chủ tài khoản</label>
          <input
            className="w-full p-2 rounded border"
            value={bankInfo.accountHolder}
            onChange={e =>
              setBankInfo(bi => ({ ...bi, accountHolder: e.target.value }))
            }
            placeholder="Ví dụ: NGUYEN VAN A"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-medium">Ảnh QR chuyển khoản</label>
          <input
            type="file"
            accept="image/*"
            onChange={onQrUpload}
            className="block"
          />
          {qrImgUploading && (
            <p className="text-xs mt-1 text-gray-500">Đang tải ảnh...</p>
          )}
          {bankInfo.qrUrl && !qrImgUploading && (
            <img
              src={bankInfo.qrUrl}
              alt="QR chuyển khoản"
              className="max-w-[180px] mt-2 rounded border"
            />
          )}
        </div>
        <Button
          className="mt-2"
          onClick={onSave}
          variant="secondary"
        >
          Lưu thông tin ngân hàng &amp; QR
        </Button>
      </CardContent>
    </Card>
  );
};

export default BankInfoManager;
