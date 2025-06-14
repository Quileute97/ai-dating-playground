import React, { useState, useEffect } from 'react';
import { Users, Bot, MessageSquare, Settings, TrendingUp, Eye, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface FakeUser {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  bio: string;
  aiPrompt: string;
  isActive: boolean;
}

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: string;
}

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
      const { data, error } = await supabase
        .from("upgrade_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (data && typeof data.count === "number") setPendingUpgradeCount(data.count);
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

  const handleSaveSettings = () => {
    // Save OpenAI API key to AI service
    if (settings.openaiApiKey) {
      aiService.setApiKey(settings.openaiApiKey);
    }
    
    // Here you could save other settings to localStorage or backend
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    console.log('Settings saved:', settings);
    // You could show a toast notification here
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
    alert('Đã lưu thông tin tài khoản ngân hàng & QR!');
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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chat AI</CardTitle>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">567</div>
                  <p className="text-xs text-muted-foreground">cuộc chat hôm nay</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">matches hôm nay</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Online</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">đang online</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'Minh Anh', action: 'Match với Luna (AI)', time: '2 phút trước' },
                    { user: 'Hoàng Nam', action: 'Chat với Alex (AI)', time: '5 phút trước' },
                    { user: 'Thu Hà', action: 'Swipe right 3 profiles', time: '10 phút trước' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fake Users Tab */}
          <TabsContent value="fake-users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quản lý người dùng ảo</h2>
              <Button 
                onClick={() => setShowAddUserModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm user ảo
              </Button>
            </div>

            <div className="grid gap-4">
              {fakeUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{user.name}</h3>
                          <span className="text-sm text-gray-600">
                            {user.gender === 'female' ? '♀' : '♂'} {user.age} tuổi
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{user.bio}</p>
                        <p className="text-xs text-gray-500 italic">
                          AI Prompt: {user.aiPrompt.substring(0, 100)}...
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setChatFakeUser(user)}
                          >
                            Nhắn tin
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPostFakeUser(user)}
                          >
                            Đăng bài
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFakeUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Modal chat với user ảo */}
            <FakeUserChatModal
              isOpen={!!chatFakeUser}
              user={chatFakeUser && {
                id: chatFakeUser.id,
                name: chatFakeUser.name,
                avatar: chatFakeUser.avatar,
                aiPrompt: chatFakeUser.aiPrompt
              }}
              onClose={() => setChatFakeUser(null)}
              userRealId={user?.id || ""}
            />
            {/* Modal đăng bài với user ảo */}
            <PostAsFakeUserModal
              isOpen={!!postFakeUser}
              user={postFakeUser && {
                id: postFakeUser.id,
                name: postFakeUser.name,
                avatar: postFakeUser.avatar
              }}
              onClose={() => setPostFakeUser(null)}
              onPost={content => {
                if (postFakeUser) handlePostAsFakeUser(content, postFakeUser);
              }}
            />
          </TabsContent>

          {/* AI Prompts Tab */}
          <TabsContent value="ai-prompts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quản lý AI Prompts</h2>
              <Button 
                onClick={() => setShowAddPromptModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm prompt mới
              </Button>
            </div>

            <div className="grid gap-4">
              {aiPrompts.map((prompt) => (
                <Card key={prompt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{prompt.name}</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {prompt.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          {prompt.prompt.substring(0, 150)}...
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAIPrompt(prompt)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePrompt(prompt.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Cài đặt hệ thống</h2>
              <Button 
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-green-500 to-blue-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Lưu cài đặt
              </Button>
            </div>
            
            <div className="grid gap-6">
              {/* Card: Cài đặt quảng cáo header */}
              <HeaderAdManager
                headerAdCode={headerAdCode}
                setHeaderAdCode={setHeaderAdCode}
                onSave={handleSaveHeaderAdCode}
              />

              {/* Card: Thông tin ngân hàng và QR */}
              <BankInfoManager
                bankInfo={bankInfo}
                setBankInfo={setBankInfo}
                onSave={handleSaveBankInfo}
                qrImgUploading={qrImgUploading}
                onQrUpload={handleQrUpload}
              />

              {/* ... keep existing AI setting and match setting cards ... */}
              {/* Chèn phần cài đặt AI + matching, sau các cards mới thêm */}
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt AI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">API Key OpenAI</label>
                    <input 
                      type="password" 
                      placeholder="sk-..."
                      value={settings.openaiApiKey}
                      onChange={(e) => setSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timeout chat (giây)</label>
                    <input 
                      type="number" 
                      value={settings.chatTimeout}
                      onChange={(e) => setSettings(prev => ({ ...prev, chatTimeout: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt matching</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tỉ lệ match với AI (%)</label>
                    <input 
                      type="number" 
                      value={settings.aiMatchRate}
                      onChange={(e) => setSettings(prev => ({ ...prev, aiMatchRate: parseInt(e.target.value) }))}
                      min="0" 
                      max="100"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phạm vi tìm kiếm mặc định (km)</label>
                    <input 
                      type="number" 
                      value={settings.searchRadius}
                      onChange={(e) => setSettings(prev => ({ ...prev, searchRadius: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Quản lý yêu cầu nâng cấp */}
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
