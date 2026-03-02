import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface RealUser {
  id: string;
  name: string | null;
  avatar: string | null;
  gender: string | null;
  age: number | null;
  bio: string | null;
  location_name: string | null;
  is_dating_active: boolean | null;
  is_premium: boolean | null;
  tai_khoan_hoat_dong: boolean | null;
  last_active: string | null;
  created_at: string | null;
}

interface ConversationWithMessages {
  id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  messages: {
    id: string;
    content: string;
    sender: string;
    sender_id: string | null;
    created_at: string;
    media_url: string | null;
  }[];
}

const AdminRealUsersTab: React.FC = () => {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<RealUser | null>(null);
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [selectedConv, setSelectedConv] = useState<ConversationWithMessages | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Lỗi tải user', description: error.message, variant: 'destructive' });
    }
    setUsers(data || []);
    setLoading(false);
  };

  const handleToggleActive = async (id: string, value: boolean) => {
    await supabase.from('profiles').update({ tai_khoan_hoat_dong: value }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, tai_khoan_hoat_dong: value } : u));
  };

  const handleViewMessages = async (user: RealUser) => {
    setSelectedUser(user);
    setLoadingConvs(true);
    setSelectedConv(null);

    // Fetch conversations where this user is user_real_id
    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_real_id', user.id)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (!convs || convs.length === 0) {
      setConversations([]);
      setLoadingConvs(false);
      return;
    }

    // Fetch other user info (fake_users) for each conversation
    const results: ConversationWithMessages[] = await Promise.all(
      convs.map(async (conv) => {
        const { data: fakeUser } = await supabase
          .from('fake_users')
          .select('name, avatar')
          .eq('id', conv.user_fake_id)
          .single();

        return {
          id: conv.id,
          other_user_name: fakeUser?.name || 'Unknown',
          other_user_avatar: fakeUser?.avatar || null,
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          messages: [],
        };
      })
    );

    setConversations(results);
    setLoadingConvs(false);
  };

  const handleViewConversation = async (conv: ConversationWithMessages) => {
    // Fetch messages for this conversation
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    setSelectedConv({
      ...conv,
      messages: messages || [],
    });
  };

  const filteredUsers = users.filter(u =>
    !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || u.id.includes(search)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách người dùng thật ({users.length})</span>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên hoặc ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Tuổi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Hoạt động cuối</TableHead>
                <TableHead>Tác vụ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không có người dùng nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <img
                        src={u.avatar || '/placeholder.svg'}
                        alt={u.name || ''}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{u.name || '(Chưa đặt tên)'}</TableCell>
                    <TableCell>{u.gender === 'female' ? '♀ Nữ' : u.gender === 'male' ? '♂ Nam' : u.gender || '-'}</TableCell>
                    <TableCell>{u.age || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={u.tai_khoan_hoat_dong ? 'default' : 'secondary'}>
                        {u.tai_khoan_hoat_dong ? 'Hoạt động' : 'Ngưng'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.is_premium ? (
                        <Badge className="bg-yellow-500 text-white">Premium</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.last_active ? new Date(u.last_active).toLocaleString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMessages(u)}
                          title="Xem tin nhắn"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(u.id, !u.tai_khoan_hoat_dong)}
                          title={u.tai_khoan_hoat_dong ? 'Ngưng hoạt động' : 'Kích hoạt'}
                        >
                          {u.tai_khoan_hoat_dong ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-green-600" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog xem tin nhắn của user */}
      <Dialog open={!!selectedUser} onOpenChange={() => { setSelectedUser(null); setSelectedConv(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser && (
                <>
                  <img src={selectedUser.avatar || '/placeholder.svg'} className="w-8 h-8 rounded-full object-cover" />
                  <span>Tin nhắn của {selectedUser.name || selectedUser.id}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {loadingConvs ? (
            <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
          ) : selectedConv ? (
            <div className="space-y-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedConv(null)}>
                ← Quay lại danh sách
              </Button>
              <div className="flex items-center gap-2 mb-2">
                <img src={selectedConv.other_user_avatar || '/placeholder.svg'} className="w-6 h-6 rounded-full object-cover" />
                <span className="font-medium text-sm">{selectedConv.other_user_name}</span>
              </div>
              <ScrollArea className="h-[400px] border rounded-lg p-3">
                {selectedConv.messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">Chưa có tin nhắn</div>
                ) : (
                  <div className="space-y-2">
                    {selectedConv.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'real' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                            msg.sender === 'real'
                              ? 'bg-primary text-primary-foreground'
                              : msg.sender === 'admin'
                              ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-xs opacity-70 mb-1">
                            {msg.sender === 'real' ? selectedUser?.name : msg.sender === 'admin' ? '🔧 Admin' : selectedConv.other_user_name}
                          </div>
                          {msg.media_url && (
                            <img src={msg.media_url} className="max-w-full rounded mb-1" alt="" />
                          )}
                          <p>{msg.content}</p>
                          <div className="text-[10px] opacity-50 mt-1">
                            {new Date(msg.created_at).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">User này chưa có cuộc trò chuyện nào</div>
              ) : (
                <div className="space-y-2">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewConversation(conv)}
                    >
                      <img src={conv.other_user_avatar || '/placeholder.svg'} className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{conv.other_user_name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {conv.last_message || 'Chưa có tin nhắn'}
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {conv.last_message_at ? new Date(conv.last_message_at).toLocaleString('vi-VN') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRealUsersTab;
