import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, ArrowUpDown, Gift, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StarStats {
  totalUsers: number;
  totalBalance: number;
  totalDonated: number;
  totalPurchased: number;
  totalDailyClaims: number;
}

interface UserStarRow {
  user_id: string;
  balance: number;
  last_daily_claim: string | null;
  profile_name: string | null;
  profile_avatar: string | null;
}

interface TransactionRow {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  related_user_id: string | null;
  note: string | null;
  created_at: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  daily_claim: { label: 'Nhận hàng ngày', color: 'bg-green-100 text-green-800' },
  purchase: { label: 'Mua sao', color: 'bg-blue-100 text-blue-800' },
  donate_sent: { label: 'Donate đi', color: 'bg-orange-100 text-orange-800' },
  donate_received: { label: 'Nhận donate', color: 'bg-purple-100 text-purple-800' },
};

const AdminStarsTab: React.FC = () => {
  const [stats, setStats] = useState<StarStats>({ totalUsers: 0, totalBalance: 0, totalDonated: 0, totalPurchased: 0, totalDailyClaims: 0 });
  const [userStars, setUserStars] = useState<UserStarRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [activeView, setActiveView] = useState<'balances' | 'transactions'>('balances');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUserStars(), fetchTransactions()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [balancesRes, transactionsRes] = await Promise.all([
      supabase.from('user_stars').select('balance'),
      supabase.from('star_transactions').select('type, amount'),
    ]);

    const balances = balancesRes.data || [];
    const txns = transactionsRes.data || [];

    setStats({
      totalUsers: balances.length,
      totalBalance: balances.reduce((sum, b) => sum + (b.balance || 0), 0),
      totalDonated: txns.filter(t => t.type === 'donate_sent').reduce((sum, t) => sum + t.amount, 0),
      totalPurchased: txns.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0),
      totalDailyClaims: txns.filter(t => t.type === 'daily_claim').reduce((sum, t) => sum + t.amount, 0),
    });
  };

  const fetchUserStars = async () => {
    const { data: stars } = await supabase.from('user_stars').select('user_id, balance, last_daily_claim').order('balance', { ascending: false });
    if (!stars) { setUserStars([]); return; }

    const userIds = stars.map(s => s.user_id);
    const { data: profiles } = await supabase.from('profiles').select('id, name, avatar').in('id', userIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    setUserStars(stars.map(s => ({
      ...s,
      profile_name: profileMap.get(s.user_id)?.name || null,
      profile_avatar: profileMap.get(s.user_id)?.avatar || null,
    })));
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('star_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setTransactions(data || []);
  };

  const handleUpdateBalance = async (userId: string) => {
    const newBalance = parseInt(editBalance);
    if (isNaN(newBalance) || newBalance < 0) {
      toast({ title: 'Lỗi', description: 'Số dư không hợp lệ', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('user_stars').update({ balance: newBalance }).eq('user_id', userId);
    if (error) {
      toast({ title: 'Lỗi', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Thành công', description: `Đã cập nhật số dư thành ${newBalance} ⭐` });
      setEditingUserId(null);
      fetchData();
    }
  };

  const filteredUsers = userStars.filter(u =>
    !searchTerm || (u.profile_name?.toLowerCase().includes(searchTerm.toLowerCase())) || u.user_id.includes(searchTerm)
  );

  if (loading) return <div className="text-center py-8">Đang tải dữ liệu sao...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Người dùng có sao</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <Star className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <div className="text-2xl font-bold">{stats.totalBalance}</div>
            <p className="text-xs text-muted-foreground">Tổng sao lưu hành</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{stats.totalPurchased}</div>
            <p className="text-xs text-muted-foreground">Sao đã mua</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <Gift className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{stats.totalDonated}</div>
            <p className="text-xs text-muted-foreground">Sao đã donate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <ArrowUpDown className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{stats.totalDailyClaims}</div>
            <p className="text-xs text-muted-foreground">Sao miễn phí</p>
          </CardContent>
        </Card>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2">
        <Button variant={activeView === 'balances' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('balances')}>
          Số dư người dùng
        </Button>
        <Button variant={activeView === 'transactions' ? 'default' : 'outline'} size="sm" onClick={() => setActiveView('transactions')}>
          Lịch sử giao dịch
        </Button>
      </div>

      {activeView === 'balances' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Số dư sao người dùng</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Tìm theo tên hoặc ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead className="text-right">Số dư ⭐</TableHead>
                  <TableHead>Nhận sao lần cuối</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                )}
                {filteredUsers.map(u => (
                  <TableRow key={u.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {u.profile_avatar ? (
                          <img src={u.profile_avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">?</div>
                        )}
                        <div>
                          <div className="font-medium">{u.profile_name || 'Ẩn danh'}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">{u.user_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {editingUserId === u.user_id ? (
                        <Input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="w-24 ml-auto" min={0} />
                      ) : (
                        <span className="font-semibold text-yellow-600">{u.balance}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.last_daily_claim ? new Date(u.last_daily_claim).toLocaleString('vi-VN') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {editingUserId === u.user_id ? (
                        <div className="flex gap-1 justify-end">
                          <Button size="sm" onClick={() => handleUpdateBalance(u.user_id)}>Lưu</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingUserId(null)}>Huỷ</Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => { setEditingUserId(u.user_id); setEditBalance(String(u.balance)); }}>
                          Chỉnh sửa
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeView === 'transactions' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">100 giao dịch gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Chưa có giao dịch</TableCell></TableRow>
                )}
                {transactions.map(tx => {
                  const typeInfo = typeLabels[tx.type] || { label: tx.type, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">{new Date(tx.created_at).toLocaleString('vi-VN')}</TableCell>
                      <TableCell className="text-xs truncate max-w-[120px]">{tx.user_id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={typeInfo.color}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{tx.amount} ⭐</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.note || '—'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminStarsTab;
