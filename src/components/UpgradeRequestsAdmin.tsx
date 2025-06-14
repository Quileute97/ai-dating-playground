
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type UpgradeRequest = {
  id: string;
  user_id: string;
  user_email: string | null;
  type: "gold" | "nearby";
  status: string;
  price: number;
  bank_info: any;
  created_at: string;
  approved_at: string | null;
  admin_id: string | null;
  note: string | null;
};

export default function UpgradeRequestsAdmin() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Lấy tất cả requests
  async function fetchRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("upgrade_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRequests(data as UpgradeRequest[]);
    setLoading(false);
  }

  // Admin duyệt hoặc từ chối
  async function handleApprove(id: string, approved = true) {
    setApproving(id);
    await supabase
      .from("upgrade_requests")
      .update({
        status: approved ? "approved" : "rejected",
        approved_at: approved ? new Date().toISOString() : null
      })
      .eq("id", id);

    fetchRequests();
    setApproving(null);
  }

  const colorByStatus = (status: string) =>
    status === "approved"
      ? "text-green-700 bg-green-50"
      : status === "pending"
      ? "text-yellow-700 bg-yellow-50"
      : "text-red-700 bg-red-50";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yêu cầu nâng cấp tài khoản</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {loading ? (
            <div>Đang tải danh sách...</div>
          ) : (
            <table className="min-w-[600px] w-full border rounded text-sm">
              <thead>
                <tr>
                  <th className="p-2 font-semibold">Người dùng</th>
                  <th className="p-2">Gói</th>
                  <th className="p-2">Giá(VNĐ)</th>
                  <th className="p-2">Trạng thái</th>
                  <th className="p-2">Tạo lúc</th>
                  <th className="p-2">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Không có yêu cầu nào.
                    </td>
                  </tr>
                )}
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="p-2">
                      <div className="font-semibold">{req.user_email || req.user_id}</div>
                    </td>
                    <td className="p-2">{req.type === "gold" ? "GOLD" : "Mở rộng phạm vi"}</td>
                    <td className="p-2 text-right">{req.price.toLocaleString()}</td>
                    <td className={`p-2 ${colorByStatus(req.status)} rounded`}>{req.status}</td>
                    <td className="p-2">{new Date(req.created_at).toLocaleString("vi-VN")}</td>
                    <td className="p-2">
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={approving === req.id}
                            onClick={() => handleApprove(req.id, true)}
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={approving === req.id}
                            onClick={() => handleApprove(req.id, false)}
                          >
                            Từ chối
                          </Button>
                        </div>
                      )}
                      {req.status !== "pending" && (
                        <span>{req.status === "approved" ? "Đã duyệt" : "Từ chối"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
