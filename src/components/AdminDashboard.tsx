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

import HeaderAdManager from "./HeaderAdManager";
import BankInfoManager from "./BankInfoManager";
import UpgradeRequestsAdmin from "./UpgradeRequestsAdmin";

import AdminOverviewTab from "./AdminOverviewTab";
import AdminFakeUsersTab from "./AdminFakeUsersTab";
import AdminAIPromptsTab from "./AdminAIPromptsTab";
import AdminSettingsTab from "./AdminSettingsTab";

import { toast } from "@/hooks/use-toast";
import type { FakeUser, AIPrompt } from "@/types/admin";

const mockFakeUsers: FakeUser[] = [
  {
    id: '1',
    name: 'Luna',
    avatar: '/placeholder.svg',
    gender: 'female',
    age: 22,
    bio: 'Cô gái Gen Z yêu mèo và indie music',
    aiPrompt: 'Trả lời như một cô gái Gen Z năng động, thích mèo và âm nhạc indie',
    isActive: true
  },
  {
    id: '2',
    name: 'Alex',
    avatar: '/placeholder.svg', 
    gender: 'male',
    age: 25,
    bio: 'Trai cool ngầu, ít nói nhưng sâu sắc',
    aiPrompt: 'Trả lời ngắn gọn, phong cách cool ngầu, đôi khi hơi lạnh lùng',
    isActive: true
  }
];

const mockAIPrompts: AIPrompt[] = [
  {
    id: '1',
    name: 'Người yêu ghen tuông',
    description: 'AI sẽ trả lời như một người yêu hay ghen và quan tâm',
    prompt: 'Hãy trả lời như một người yêu hay ghen tuông, quan tâm đến từng hành động của đối phương...',
    category: 'Romance'
  },
  {
    id: '2',
    name: 'Gen Z trendy',
    description: 'Phong cách trẻ trung, dùng từ ngữ Gen Z',
    prompt: 'Trả lời theo phong cách Gen Z, dùng từ ngữ trendy như "đu trend", "flex", "vibe"...',
    category: 'Lifestyle'
  }
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [fakeUsers, setFakeUsers] = useState(mockFakeUsers);
  const [aiPrompts, setAIPrompts] = useState(mockAIPrompts);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    openaiApiKey: '',
    chatTimeout: 60,
    aiMatchRate: 30,
    searchRadius: 5
  });

  const [editingFakeUser, setEditingFakeUser] = useState<FakeUser | null>(null);
  const [editingAIPrompt, setEditingAIPrompt] = useState<AIPrompt | null>(null);

  const [chatFakeUser, setChatFakeUser] = useState<FakeUser | null>(null);
  const [postFakeUser, setPostFakeUser] = useState<FakeUser | null>(null);

  const [user, setUser] = useState<any>(null); // Dùng user info từ DatingApp nếu có

  // Ad code for header
  const [headerAdCode, setHeaderAdCode] = useState(
    localStorage.getItem('headerAdCode') || ''
  );

  // Banking info & QR for upgrade
  const [bankInfo, setBankInfo] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem('bankInfo') ?? '{}');
      return {
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        accountHolder: data.accountHolder || '',
        qrUrl: data.qrUrl || ''
      };
    } catch {
      return {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        qrUrl: ''
      };
    }
  });
  const [qrImgUploading, setQrImgUploading] = useState(false);

  // NEW: Đếm số yêu cầu upgrade pending để hiện thông báo cho admin
  const [pendingUpgradeCount, setPendingUpgradeCount] = React.useState(0);

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

  const handleAddFakeUser = (userData: Omit<FakeUser, 'id'>) => {
    const newUser: FakeUser = {
      ...userData,
      id: Date.now().toString()
    };
    setFakeUsers(prev => [...prev, newUser]);
  };

  const handleAddAIPrompt = (promptData: Omit<AIPrompt, 'id'>) => {
    const newPrompt: AIPrompt = {
      ...promptData,
      id: Date.now().toString()
    };
    setAIPrompts(prev => [...prev, newPrompt]);
  };

  const handleDeleteUser = (userId: string) => {
    setFakeUsers(prev => prev.filter(user => user.id !== userId));
  };

  const handleDeletePrompt = (promptId: string) => {
    setAIPrompts(prev => prev.filter(prompt => prompt.id !== promptId));
  };

  // Sử dụng toast khi lưu settings thành công
  const handleSaveSettings = () => {
    // Save OpenAI API key to AI service
    if (settings.openaiApiKey) {
      aiService.setApiKey(settings.openaiApiKey);
    }

    // Save other settings
    localStorage.setItem('adminSettings', JSON.stringify(settings));

    toast({
      title: "Đã lưu cài đặt",
      description: "Cài đặt hệ thống đã được lưu thành công!",
    });
    console.log('Settings saved:', settings);
  };

  const handleEditFakeUser = (user: FakeUser) => setEditingFakeUser(user);
  const handleUpdateFakeUser = (user: FakeUser) => {
    setFakeUsers(prev =>
      prev.map(fu => fu.id === user.id ? user : fu)
    );
  };

  const handleEditAIPrompt = (prompt: AIPrompt) => setEditingAIPrompt(prompt);
  const handleUpdateAIPrompt = (prompt: AIPrompt) => {
    setAIPrompts(prev =>
      prev.map(p => p.id === prompt.id ? prompt : p)
    );
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
  const handleSaveBankInfo = () => {
    localStorage.setItem('bankInfo', JSON.stringify(bankInfo));
    // Đảm bảo cập nhật lại state bankInfo từ localStorage
    const newInfo = JSON.parse(localStorage.getItem('bankInfo') ?? '{}');
    setBankInfo({
      bankName: newInfo.bankName || '',
      accountNumber: newInfo.accountNumber || '',
      accountHolder: newInfo.accountHolder || '',
      qrUrl: newInfo.qrUrl || ''
    });
    toast.success('Đã lưu thông tin tài khoản ngân hàng & QR!');
  };

  // Handle QR upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrImgUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setBankInfo(bi => ({ ...bi, qrUrl: reader.result as string }));
      setQrImgUploading(false);
    };
    reader.readAsDataURL(file);
  };

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
            <AdminFakeUsersTab
              fakeUsers={fakeUsers}
              setShowAddUserModal={setShowAddUserModal}
              chatFakeUser={chatFakeUser}
              setChatFakeUser={setChatFakeUser}
              postFakeUser={postFakeUser}
              setPostFakeUser={setPostFakeUser}
              handleEditFakeUser={handleEditFakeUser}
              handleDeleteUser={handleDeleteUser}
              user={user}
              aiPrompts={aiPrompts}
              handlePostAsFakeUser={handlePostAsFakeUser}
            />
          </TabsContent>

          <TabsContent value="ai-prompts" className="space-y-6">
            <AdminAIPromptsTab
              aiPrompts={aiPrompts}
              setShowAddPromptModal={setShowAddPromptModal}
              handleEditAIPrompt={handleEditAIPrompt}
              handleDeletePrompt={handleDeletePrompt}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettingsTab
              headerAdCode={headerAdCode}
              setHeaderAdCode={setHeaderAdCode}
              onSaveHeaderAd={handleSaveHeaderAdCode}
              bankInfo={bankInfo}
              setBankInfo={setBankInfo}
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
          user={editingFakeUser}
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
