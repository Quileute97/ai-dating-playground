
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Bot, MessageSquare, Settings, TrendingUp, Eye, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AddFakeUserModal from './AddFakeUserModal';
import AddAIPromptModal from './AddAIPromptModal';
import EditFakeUserModal from './EditFakeUserModal';
import EditAIPromptModal from './EditAIPromptModal';
import { aiService } from '@/services/aiService';
import FakeUserChatModal from './FakeUserChatModal';
import PostAsFakeUserModal from './PostAsFakeUserModal';
import { supabase } from "@/integrations/supabase/client";

import AdminOverviewTab from "./AdminOverviewTab";
import AdminUserManagement from "./AdminUserManagement";
import AdminFakeUsersTab from "./AdminFakeUsersTab";
import AdminAIPromptsTab from "./AdminAIPromptsTab";
import AdminSettingsTab from "./AdminSettingsTab";
import AdminTimelinePostsTab from "./AdminTimelinePostsTab";
import AdminRealUsersTab from "./AdminRealUsersTab";

import { toast } from "@/hooks/use-toast";
import type { FakeUser, AIPrompt } from "@/types/admin";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Dùng dữ liệu thật từ Supabase
  const [fakeUsers, setFakeUsers] = useState<any[]>([]);
  const [aiPrompts, setAIPrompts] = useState<AIPrompt[]>([]);

  // Đang tải dữ liệu?
  const [loadingFakeUsers, setLoadingFakeUsers] = useState(false);
  const [loadingAIPrompts, setLoadingAIPrompts] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);

  const [editingFakeUser, setEditingFakeUser] = useState<any | null>(null);
  const [editingAIPrompt, setEditingAIPrompt] = useState<AIPrompt | null>(null);

  const [chatFakeUser, setChatFakeUser] = useState<FakeUser | null>(null);
  const [postFakeUser, setPostFakeUser] = useState<FakeUser | null>(null);

  const [user, setUser] = useState<any>(null);

  // NEW: Đếm số yêu cầu upgrade pending để hiện thông báo cho admin
  const [pendingUpgradeCount, setPendingUpgradeCount] = React.useState(0);

  // Removed: realUsers state and handleToggleHoatDong moved to AdminRealUsersTab

  React.useEffect(() => {
    // Lấy số lượng pending upgrade
    const fetchUpgradeCount = async () => {
      const { count, error } = await supabase
        .from("upgrade_requests")
        .select("id", { count: "exact", head: true });
      if (typeof count === "number") setPendingUpgradeCount(count);
    };
    fetchUpgradeCount();

    // Subcribe realtime upgrade_requests
    const channel = supabase
      .channel("upgrade-requests-pending")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "upgrade_requests" },
        (payload) => {
          fetchUpgradeCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch AI Prompts từ Supabase
  useEffect(() => {
    const fetchPrompts = async () => {
      setLoadingAIPrompts(true);
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setAIPrompts(data);
      setLoadingAIPrompts(false);
    };
    fetchPrompts();
  }, []);

  // Fetch Fake Users từ Supabase
  useEffect(() => {
    const fetchFakeUsers = async () => {
      setLoadingFakeUsers(true);
      const { data, error } = await supabase
        .from('fake_users')
        .select('*, ai_prompts(name, prompt, category)')
        .order('created_at', { ascending: false });
      if (!error && data) setFakeUsers(data || []);
      setLoadingFakeUsers(false);
    };
    fetchFakeUsers();
  }, []);

  // THÊM: Refetch hỗ trợ sau khi thêm/sửa/xóa
  const refetchPrompts = async () => {
    const { data } = await supabase.from('ai_prompts').select('*').order('created_at', { ascending: false });
    setAIPrompts(data || []);
  };
  const refetchFakeUsers = async () => {
    const { data } = await supabase.from('fake_users').select('*, ai_prompts(name, prompt, category)').order('created_at', { ascending: false });
    setFakeUsers(data || []);
  };

  // Thêm Fake User
  const handleAddFakeUser = async (userData: Omit<FakeUser, 'id'> & { aiPromptId?: string }) => {
    if (!userData.aiPromptId) {
      toast({
        title: "Vui lòng chọn AI Prompt",
        description: "",
        variant: "destructive"
      });
      return;
    }
    const fakeUserData: any = {
      name: userData.name,
      avatar: userData.avatar,
      gender: userData.gender,
      age: userData.age,
      bio: userData.bio,
      ai_prompt_id: userData.aiPromptId,
      is_active: userData.isActive,
    };
    const { error } = await supabase.from('fake_users').insert(fakeUserData);
    if (error) {
      toast({
        title: "Lỗi thêm user ảo",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Đã thêm người dùng ảo",
        description: "",
        variant: "default"
      });
    }
    refetchFakeUsers();
  };

  // Thêm AI Prompt
  const handleAddAIPrompt = async (promptData: Omit<AIPrompt, 'id'>) => {
    await supabase.from('ai_prompts').insert({
      ...promptData,
    });
    refetchPrompts();
  };

  // Xóa Fake User
  const handleDeleteUser = async (userId: string) => {
    await supabase.from('fake_users').delete().eq('id', userId);
    refetchFakeUsers();
  };

  // Xóa AI Prompt
  const handleDeletePrompt = async (promptId: string) => {
    await supabase.from('ai_prompts').delete().eq('id', promptId);
    refetchPrompts();
  };

  // Update Fake User
  const handleUpdateFakeUser = async (user: FakeUser) => {
    const selectedPrompt = aiPrompts.find(p => p.prompt === user.aiPrompt);
    await supabase.from('fake_users').update({
      name: user.name,
      avatar: user.avatar,
      gender: user.gender,
      age: user.age,
      bio: user.bio,
      is_active: user.isActive,
      ai_prompt_id: selectedPrompt ? selectedPrompt.id : null,
    }).eq('id', user.id);
    refetchFakeUsers();
    setEditingFakeUser(null);
  };

  // Update AI Prompt
  const handleUpdateAIPrompt = async (prompt: AIPrompt) => {
    await supabase.from('ai_prompts').update({
      name: prompt.name,
      description: prompt.description,
      prompt: prompt.prompt,
      category: prompt.category,
    }).eq('id', prompt.id);
    refetchPrompts();
    setEditingAIPrompt(null);
  };

  const handlePostAsFakeUser = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!postFakeUser) return;
    
    try {
      const { error } = await supabase.from("fake_user_posts").insert({
        fake_user_id: postFakeUser.id,
        content: content,
        media_url: mediaUrl || null,
        media_type: mediaType || null,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Thành công",
        description: `Đã đăng bài với tư cách ${postFakeUser.name}`,
      });
      
      setPostFakeUser(null);
    } catch (error: any) {
      toast({
        title: "Lỗi đăng bài",
        description: error.message || "Có lỗi xảy ra",
        variant: "destructive",
      });
    }
  };

  // Tab content
  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Quản lý website hẹn hò và AI</p>
        </div>

        {/* Bổ sung thông báo nếu có đơn upgrade mới */}
        {pendingUpgradeCount > 0 && (
          <div className="mb-6 p-4 bg-yellow-100 rounded text-yellow-900 font-semibold flex items-center gap-2">
            <span>🔔 Có {pendingUpgradeCount} yêu cầu nâng cấp tài khoản mới đang chờ duyệt!</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="real-users">User thật</TabsTrigger>
            <TabsTrigger value="admin-users">Admin Users</TabsTrigger>
            <TabsTrigger value="fake-users">Người dùng ảo</TabsTrigger>
            <TabsTrigger value="ai-prompts">AI Prompts</TabsTrigger>
            <TabsTrigger value="timeline-posts">Bài đăng</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverviewTab />
          </TabsContent>

          <TabsContent value="admin-users" className="space-y-6">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="fake-users" className="space-y-6">
            {loadingFakeUsers ? (
              <div>Đang tải danh sách người dùng ảo...</div>
            ) : (
              <AdminFakeUsersTab
                fakeUsers={
                  fakeUsers.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    gender: user.gender,
                    age: user.age,
                    bio: user.bio,
                    aiPrompt: aiPrompts.find(p => p.id === user.ai_prompt_id)?.prompt || "",
                    isActive: user.is_active,
                  }))
                }
                setShowAddUserModal={setShowAddUserModal}
                chatFakeUser={chatFakeUser}
                setChatFakeUser={setChatFakeUser}
                postFakeUser={postFakeUser}
                setPostFakeUser={setPostFakeUser}
                handleEditFakeUser={setEditingFakeUser}
                handleDeleteUser={handleDeleteUser}
                user={user}
                aiPrompts={aiPrompts}
                handlePostAsFakeUser={handlePostAsFakeUser}
                refetchFakeUsers={refetchFakeUsers}
              />
            )}
          </TabsContent>

          <TabsContent value="ai-prompts" className="space-y-6">
            {loadingAIPrompts ? (
              <div>Đang tải AI Prompts...</div>
            ) : (
              <AdminAIPromptsTab
                aiPrompts={aiPrompts}
                setShowAddPromptModal={setShowAddPromptModal}
                handleEditAIPrompt={setEditingAIPrompt}
                handleDeletePrompt={handleDeletePrompt}
              />
            )}
          </TabsContent>

          <TabsContent value="timeline-posts" className="space-y-6">
            <AdminTimelinePostsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettingsTab />
          </TabsContent>

          <TabsContent value="real-users" className="space-y-6">
            <AdminRealUsersTab />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <AddFakeUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onAdd={handleAddFakeUser}
          aiPrompts={aiPrompts}
        />

        <AddAIPromptModal
          isOpen={showAddPromptModal}
          onClose={() => setShowAddPromptModal(false)}
          onAdd={handleAddAIPrompt}
        />

        {/* Thêm modal chỉnh sửa người dùng ảo */}
        <EditFakeUserModal
          isOpen={!!editingFakeUser}
          user={
            editingFakeUser
              ? {
                  ...editingFakeUser,
                  aiPrompt: aiPrompts.find(p => p.id === editingFakeUser.ai_prompt_id)?.prompt || "",
                  isActive: editingFakeUser.is_active,
                }
              : null
          }
          onClose={() => setEditingFakeUser(null)}
          onSave={handleUpdateFakeUser}
          aiPrompts={aiPrompts}
        />

        {/* Thêm modal chỉnh sửa AI Prompt */}
        <EditAIPromptModal
          isOpen={!!editingAIPrompt}
          prompt={editingAIPrompt}
          onClose={() => setEditingAIPrompt(null)}
          onSave={handleUpdateAIPrompt}
        />
      </div>
    </div>
  );
};
export default AdminDashboard;
