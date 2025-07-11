import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, MessageSquare, FileText, Image, MapPin, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AddAdminUserModal from './AddAdminUserModal';
import EditAdminUserModal from './EditAdminUserModal';
import AdminUserChatModal from './AdminUserChatModal';
import AdminUserPostModal from './AdminUserPostModal';
import AdminUserAlbumModal from './AdminUserAlbumModal';

interface AdminUser {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  age: number;
  bio: string;
  location_name: string;
  lat: number;
  lng: number;
  interests: any;
  dating_preferences: any;
  album: any;
  height: number;
  job: string;
  education: string;
  is_dating_active: boolean;
  is_active: boolean;
  last_active: string;
  ai_prompt_id: string;
}

const AdminUserManagement: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [chatUser, setChatUser] = useState<AdminUser | null>(null);
  const [postUser, setPostUser] = useState<AdminUser | null>(null);
  const [albumUser, setAlbumUser] = useState<AdminUser | null>(null);
  const [aiPrompts, setAiPrompts] = useState<any[]>([]);

  // Fetch AI Prompts
  useEffect(() => {
    const fetchAiPrompts = async () => {
      const { data } = await supabase.from('ai_prompts').select('*');
      setAiPrompts(data || []);
    };
    fetchAiPrompts();
  }, []);

  // Fetch Admin Users
  const fetchAdminUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fake_users')
      .select('*, ai_prompts(name, prompt)')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Lỗi tải dữ liệu",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAdminUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Add Admin User
  const handleAddUser = async (userData: Omit<AdminUser, 'id'>) => {
    const { error } = await supabase.from('fake_users').insert(userData);
    
    if (error) {
      toast({
        title: "Lỗi thêm user",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã thêm user admin mới",
      });
      fetchAdminUsers();
    }
  };

  // Update Admin User
  const handleUpdateUser = async (userData: AdminUser) => {
    const { error } = await supabase
      .from('fake_users')
      .update(userData)
      .eq('id', userData.id);
    
    if (error) {
      toast({
        title: "Lỗi cập nhật",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã cập nhật user",
      });
      fetchAdminUsers();
      setEditingUser(null);
    }
  };

  // Delete Admin User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc muốn xóa user này?')) return;
    
    const { error } = await supabase
      .from('fake_users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      toast({
        title: "Lỗi xóa user",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Thành công",
        description: "Đã xóa user",
      });
      fetchAdminUsers();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Admin Users</h2>
          <p className="text-gray-600">Tạo và quản lý các user để hiển thị trong app</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm User Mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Users</p>
                <p className="text-2xl font-bold">{adminUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang Hoạt Động</p>
                <p className="text-2xl font-bold">{adminUsers.filter(u => u.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hẹn Hò Active</p>
                <p className="text-2xl font-bold">{adminUsers.filter(u => u.is_dating_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có user nào. Hãy thêm user đầu tiên!
              </div>
            ) : (
              adminUsers.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatar || '/placeholder.svg'}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">
                          {user.gender === 'female' ? '♀' : '♂'} {user.age} tuổi
                          {user.location_name && ` • ${user.location_name}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.is_active ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_dating_active
                              ? 'bg-pink-100 text-pink-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.is_dating_active ? 'Hẹn hò ON' : 'Hẹn hò OFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChatUser(user)}
                        title="Quản lý tin nhắn"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPostUser(user)}
                        title="Đăng bài viết"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAlbumUser(user)}
                        title="Quản lý album"
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddAdminUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddUser}
        aiPrompts={aiPrompts}
      />

      <EditAdminUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUpdate={handleUpdateUser}
        aiPrompts={aiPrompts}
      />

      <AdminUserChatModal
        isOpen={!!chatUser}
        user={chatUser}
        onClose={() => setChatUser(null)}
      />

      <AdminUserPostModal
        isOpen={!!postUser}
        user={postUser}
        onClose={() => setPostUser(null)}
        onPostCreated={fetchAdminUsers}
      />

      <AdminUserAlbumModal
        isOpen={!!albumUser}
        user={albumUser}
        onClose={() => setAlbumUser(null)}
        onAlbumUpdated={fetchAdminUsers}
      />
    </div>
  );
};

export default AdminUserManagement;