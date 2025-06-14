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
import { useBankInfo } from "@/hooks/useBankInfo";

import HeaderAdManager from "./HeaderAdManager";
import BankInfoManager from "./BankInfoManager";
import UpgradeRequestsAdmin from "./UpgradeRequestsAdmin";

import AdminOverviewTab from "./AdminOverviewTab";
import AdminFakeUsersTab from "./AdminFakeUsersTab";
import AdminAIPromptsTab from "./AdminAIPromptsTab";
import AdminSettingsTab from "./AdminSettingsTab";

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
  
  // Settings state
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    chatTimeout: 60,
    aiMatchRate: 30,
    searchRadius: 5
  });

  const [editingFakeUser, setEditingFakeUser] = useState<any | null>(null);
  const [editingAIPrompt, setEditingAIPrompt] = useState<AIPrompt | null>(null);

  const [chatFakeUser, setChatFakeUser] = useState<FakeUser | null>(null);
  const [postFakeUser, setPostFakeUser] = useState<FakeUser | null>(null);

  const [user, setUser] = useState<any>(null); // Dùng user info từ DatingApp nếu có

  // Ad code for header
  const [headerAdCode, setHeaderAdCode] = useState(
    localStorage.getItem('headerAdCode') || ''
  );

  // Banking info & QR for upgrade
  const { bankInfo, refetch: refetchBankInfo } = useBankInfo();
  const [bankInfoDraft, setBankInfoDraft] = useState(bankInfo);
  const [qrImgUploading, setQrImgUploading] = useState(false);

  // NEW: Đếm số yêu cầu upgrade pending để hiện thông báo cho admin
  const [pendingUpgradeCount, setPendingUpgradeCount] = React.useState(0);

  // NEW: Tải dữ liệu user thật từ bảng profiles để quản lý "Tài khoản hoạt động"
  const [realUsers, setRealUsers] = React.useState<any[]>([]);
  React.useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setRealUsers(data || []);
    };
    fetchProfiles();
  }, []);

  // Cập nhật trạng thái tài khoản hoạt động
  const handleToggleHoatDong = async (id: string, value: boolean) => {
    await supabase
      .from("profiles")
      .update({ tai_khoan_hoat_dong: value })
      .eq("id", id);

    setRealUsers((users) =>
      users.map((u) => (u.id === id ? { ...u, tai_khoan_hoat_dong: value } : u))
    );
  };

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
  const handleAddFakeUser = async (userData: Omit<FakeUser, 'id'>) => {
    const { aiPrompt, ...rest } = userData;
    // Lấy AI Prompt id ứng với value được chọn
    const selectedPrompt = aiPrompts.find(p => p.prompt === aiPrompt);
    await supabase.from('fake_users').insert({
      ...rest,
      ai_prompt_id: selectedPrompt ? selectedPrompt.id : null,
      is_active: userData.isActive,
    });
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

  const handlePostAsFakeUser = (content: string, user: FakeUser) => {
    // Chỉ hiển thị thông báo, chưa update trực tiếp vào Timeline
    alert(`Đã đăng bài với tư cách ${user.name}:\n\n${content}`);
    // Để tích hợp thực tế: cần truyền tới component Timeline thông qua global state hoặc props callback
  };

  // Save header ad code
  const handleSaveHeaderAdCode = () => {
    localStorage.setItem('headerAdCode', headerAdCode);
    // Có thể show toast ở đây
    alert('Đã lưu mã quảng cáo header!');
  };

  // Save bank info
  const handleSaveBankInfo = async () => {
    const { data, error } = await supabase
      .from("bank_info")
      .upsert(
        [
          {
            bank_name: bankInfoDraft.bankName,
            account_number: bankInfoDraft.accountNumber,
            account_holder: bankInfoDraft.accountHolder,
            qr_url: bankInfoDraft.qrUrl,
            updated_at: new Date().toISOString(),
          }
        ],
        { onConflict: "id" }
      );
    if (error) {
      toast({
        title: "Lỗi",
        description: "Không lưu được thông tin ngân hàng.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Đã lưu thông tin ngân hàng & QR!",
        description: "",
        variant: "default"
      });
      refetchBankInfo();
    }
  };

  // Handle QR upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrImgUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newQrUrl = reader.result as string;
      setBankInfoDraft((bi) => ({ ...bi, qrUrl: newQrUrl }));
      // Lưu luôn vào Supabase
      await supabase.from("bank_info").upsert([
        {
          bank_name: bankInfoDraft.bankName,
          account_number: bankInfoDraft.accountNumber,
          account_holder: bankInfoDraft.accountHolder,
          qr_url: newQrUrl,
          updated_at: new Date().toISOString(),
        }
      ], { onConflict: "id" });
      setQrImgUploading(false);
      refetchBankInfo();
    };
    reader.readAsDataURL(file);
  };

  // Save AI/General settings
  const handleSaveSettings = () => {
    // Lưu settings vào localStorage (hoặc thêm API/save Supabase ở đây nếu cần)
    localStorage.setItem('datingAppSettings', JSON.stringify(settings));
    toast({
      title: "Đã lưu cài đặt hệ thống!",
      description: "",
      variant: "default"
    });
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="fake-users">Người dùng ảo</TabsTrigger>
            <TabsTrigger value="ai-prompts">AI Prompts</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            <TabsTrigger value="upgrade-requests">
              Yêu cầu nâng cấp
              {pendingUpgradeCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-400 text-xs rounded text-black">{pendingUpgradeCount}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverviewTab />
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

          <TabsContent value="settings" className="space-y-6">
            <AdminSettingsTab
              headerAdCode={headerAdCode}
              setHeaderAdCode={setHeaderAdCode}
              onSaveHeaderAd={handleSaveHeaderAdCode}
              bankInfo={bankInfoDraft}
              setBankInfo={setBankInfoDraft}
              onSaveBankInfo={handleSaveBankInfo}
              qrImgUploading={qrImgUploading}
              onQrUpload={handleQrUpload}
              settings={settings}
              setSettings={setSettings}
              handleSaveSettings={handleSaveSettings}
            />
          </TabsContent>

          <TabsContent value="upgrade-requests" className="space-y-6">
            <UpgradeRequestsAdmin />
          </TabsContent>

          {/* THÊM tab quản lý user thật nếu muốn */}
          <TabsContent value="real-users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách tài khoản người dùng thật</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-[600px] w-full border rounded text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 font-semibold">ID</th>
                        <th className="p-2">Tên</th>
                        <th className="p-2">Giới tính</th>
                        <th className="p-2">Tuổi</th>
                        <th className="p-2">Hoạt động</th>
                        <th className="p-2">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-4">
                            Không có tài khoản nào.
                          </td>
                        </tr>
                      )}
                      {realUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="p-2">{u.id}</td>
                          <td className="p-2">{u.name}</td>
                          <td className="p-2">{u.gender}</td>
                          <td className="p-2">{u.age}</td>
                          <td className="p-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full mr-1 ${
                                u.tai_khoan_hoat_dong ? "bg-green-500" : "bg-gray-400"
                              }`}
                              title={u.tai_khoan_hoat_dong ? "Hoạt động" : "Ngưng hoạt động"}
                            ></span>
                            {u.tai_khoan_hoat_dong ? "Hoạt động" : "Ngưng"}
                          </td>
                          <td className="p-2">
                            <button
                              className={`px-3 py-1 rounded ${
                                u.tai_khoan_hoat_dong
                                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                              onClick={() =>
                                handleToggleHoatDong(u.id, !u.tai_khoan_hoat_dong)
                              }
                            >
                              {u.tai_khoan_hoat_dong ? "Ngưng hoạt động" : "Kích hoạt"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
