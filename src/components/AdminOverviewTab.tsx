
import React from 'react';
import { Users, Bot, TrendingUp, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAdminOverviewStats } from "@/hooks/useAdminOverviewStats";

const AdminOverviewTab: React.FC = () => {
  const { data, isLoading } = useAdminOverviewStats();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : data?.userCount ?? 0}
            </div>
            {/* Nếu muốn: +12% từ tháng trước, có thể bổ sung sau */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat AI</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : data?.aiChats ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Tổng cuộc chat AI</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : data?.matches ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Tổng số matches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : data?.onlineCount ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">đang online (5 phút gần nhất)</p>
          </CardContent>
        </Card>
      </div>
      {/* Hoạt động gần đây có thể nâng cấp về sau để lấy real data */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-muted-foreground">
            (Đang cập nhật dữ liệu thật...)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverviewTab;
