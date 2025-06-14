
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HeaderAdManagerProps {
  headerAdCode: string;
  setHeaderAdCode: (value: string) => void;
  onSave: () => void;
}

const HeaderAdManager: React.FC<HeaderAdManagerProps> = ({ headerAdCode, setHeaderAdCode, onSave }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý mã quảng cáo header</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Mã quảng cáo (dán script/HTML sẽ nhúng lên &lt;head&gt; của web)
          </label>
          <textarea
            value={headerAdCode}
            onChange={e => setHeaderAdCode(e.target.value)}
            className="w-full min-h-[100px] font-mono rounded p-2 border resize-y"
            placeholder="<script>...</script>"
          ></textarea>
          <Button
            className="mt-2"
            onClick={onSave}
            variant="secondary"
          >
            Lưu mã quảng cáo
          </Button>
          {!headerAdCode && (
            <div className="text-xs text-destructive mt-1">
              ⚠️ Bạn chưa dán mã quảng cáo nào.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderAdManager;
