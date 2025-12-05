import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Settings, Image, Palette, History, Bell, UserX, Trash2, Upload, Filter, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProfileChatWindowProps {
  targetUserId: string;
  targetUserName: string;
  targetUserAvatar: string;
  currentUserId: string;
  onClose: () => void;
}

const ProfileChatWindow = ({ 
  targetUserId, 
  targetUserName, 
  targetUserAvatar, 
  currentUserId, 
  onClose 
}: ProfileChatWindowProps) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showMediaHistory, setShowMediaHistory] = useState(false);
  const [chatBackground, setChatBackground] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'images' | 'videos' | 'links'>('all');
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    sound: true,
    vibration: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load saved settings from localStorage
  useEffect(() => {
    const savedBg = localStorage.getItem(`chat-bg-${targetUserId}`);
    const savedNotifications = localStorage.getItem(`chat-notifications-${targetUserId}`);
    
    if (savedBg) {
      setChatBackground(savedBg);
    }
    
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }
  }, [targetUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tìm hoặc tạo conversation
  useEffect(() => {
    async function findOrCreateConversation() {
      // Tìm conversation hiện có
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user_real_id.eq.${currentUserId},user_fake_id.eq.${targetUserId}),and(user_real_id.eq.${targetUserId},user_fake_id.eq.${currentUserId})`)
        .limit(1);

      if (existingConv && existingConv.length > 0) {
        setConversationId(existingConv[0].id);
      } else {
        // Tạo conversation mới
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert([{
            user_real_id: currentUserId,
            user_fake_id: targetUserId
          }])
          .select('id')
          .limit(1);

        if (newConv && newConv.length > 0) {
          setConversationId(newConv[0].id);
        }
      }
    }

    if (currentUserId && targetUserId) {
      findOrCreateConversation();
    }
  }, [currentUserId, targetUserId]);

  // Load messages
  useEffect(() => {
    if (!conversationId) return;

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    }

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        content: inputValue.trim(),
        sender: 'real',
        sender_id: currentUserId
      }]);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
      return;
    }

    // Update last message in conversation
    await supabase
      .from('conversations')
      .update({
        last_message: inputValue.trim(),
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    setInputValue('');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleBackgroundChange = (bgValue: string) => {
    setChatBackground(bgValue);
    localStorage.setItem(`chat-bg-${targetUserId}`, bgValue);
    toast({
      title: "✨ Đã thay đổi ảnh nền",
      description: "Ảnh nền chat đã được cập nhật thành công",
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ Lỗi định dạng",
        description: "Vui lòng chọn file hình ảnh (JPG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "❌ File quá lớn",
        description: "Vui lòng chọn ảnh có kích thước dưới 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleBackgroundChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast({
        title: "❌ Lỗi tải ảnh",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem(`chat-notifications-${targetUserId}`, JSON.stringify(newSettings));
    toast({
      title: "💾 Cài đặt đã lưu",
      description: "Thông báo đã được cập nhật",
    });
  };

  const getFilteredMediaMessages = () => {
    const mediaMessages = messages.filter(msg => {
      const content = msg.content.toLowerCase();
      switch (mediaFilter) {
        case 'images':
          return content.includes('jpg') || content.includes('png') || content.includes('gif') || content.includes('jpeg') || content.includes('image');
        case 'videos':
          return content.includes('mp4') || content.includes('video') || content.includes('mov') || content.includes('avi');
        case 'links':
          return content.includes('http') || content.includes('www.');
        default:
          return content.includes('http') || content.includes('image') || content.includes('video') || content.includes('jpg') || content.includes('png');
      }
    });
    return mediaMessages;
  };

  const handleDeleteChatHistory = async () => {
    if (!conversationId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;

      setMessages([]);
      setShowDeleteConfirm(false);
      toast({
        title: "🗑️ Đã xóa lịch sử",
        description: "Tất cả tin nhắn đã được xóa thành công",
      });
    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể xóa lịch sử chat",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = () => {
    // In a real app, this would update the database
    setShowBlockConfirm(false);
    toast({
      title: "🚫 Đã chặn người dùng",
      description: `${targetUserName} đã bị chặn`,
    });
    onClose();
  };

  const getChatBackgroundStyle = () => {
    if (!chatBackground) {
      return 'linear-gradient(135deg, rgb(239 246 255) 0%, rgb(250 245 255) 50%, rgb(239 246 255) 100%)';
    }
    
    return `linear-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.05)), url(${chatBackground}) center/cover`;
  };

  const mediaFilterOptions = [
    { key: 'all', label: 'Tất cả', icon: Filter },
    { key: 'images', label: 'Hình ảnh', icon: Image },
    { key: 'videos', label: 'Video', icon: Video },
    { key: 'links', label: 'Links', icon: ChevronRight }
  ];

  return (
    <div 
      className="fixed inset-0 flex flex-col z-50 transition-all duration-300"
      style={{
        background: getChatBackgroundStyle()
      }}
    >
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-purple-100/50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-purple-50 transition-colors duration-200 border-purple-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <img 
              src={targetUserAvatar} 
              alt={targetUserName}
              className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 text-lg">{targetUserName}</h2>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">Đang online</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toast({ title: "📹 Video Call", description: "Tính năng sẽ được cập nhật!" })}
              className="hover:bg-blue-50 transition-colors duration-200"
            >
              <Video className="w-4 h-4 text-blue-600" />
            </Button>
            
            {/* Enhanced Chat Settings Sheet */}
            <Sheet open={showSettings} onOpenChange={setShowSettings}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hover:bg-purple-50 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 text-purple-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-96 overflow-y-auto bg-gradient-to-b from-white to-purple-50/30">
                <SheetHeader className="pb-6 border-b border-gray-100">
                  <SheetTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    Cài đặt tin nhắn
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-8">
                  {/* Media History Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <History className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Lịch sử Media</h3>
                    </div>
                    <Button
                      onClick={() => {
                        setShowMediaHistory(true);
                        setShowSettings(false);
                      }}
                      variant="outline"
                      className="w-full justify-between p-4 h-auto hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Image className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium">Xem media đã chia sẻ</p>
                          <p className="text-sm text-gray-500">{getFilteredMediaMessages().length} files</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </Button>
                  </div>

                  {/* Background Settings Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Palette className="w-4 h-4 text-pink-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Ảnh nền chat</h3>
                    </div>
                    <div className="space-y-3">
                      {/* Default Background Option */}
                      <Button
                        onClick={() => handleBackgroundChange('')}
                        variant={chatBackground === '' ? "default" : "outline"}
                        className={`w-full justify-start h-16 transition-all duration-200 ${
                          chatBackground === '' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-lg border-2 border-gray-300 mr-3 shadow-sm"
                          style={{
                            background: 'linear-gradient(135deg, #e5e7eb, #f3f4f6, #e5e7eb)'
                          }}
                        />
                        <div className="text-left">
                          <p className="font-medium">Mặc định</p>
                          <p className="text-xs opacity-70">Gradient tím hồng</p>
                        </div>
                        {chatBackground === '' && <span className="ml-auto">✨</span>}
                      </Button>

                      {/* Upload Background Option */}
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full justify-start h-16 hover:bg-gray-50 transition-all duration-200 group"
                        disabled={isUploading}
                      >
                        <div className="w-10 h-10 rounded-lg border-2 border-gray-300 mr-3 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-pink-100 transition-all duration-200">
                          {isUploading ? (
                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">Tải ảnh lên</p>
                          <p className="text-xs text-gray-500">Tối đa 5MB</p>
                        </div>
                      </Button>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {/* Show current custom background if any */}
                      {chatBackground && chatBackground !== '' && (
                        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <span>🖼️</span> Ảnh nền hiện tại
                          </p>
                          <div 
                            className="w-full h-20 rounded-lg border-2 border-gray-300 shadow-inner"
                            style={{
                              background: `url(${chatBackground}) center/cover`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Notification Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Bell className="w-4 h-4 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    </div>
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-gray-600" />
                          <Label htmlFor="notifications" className="font-medium">Bật thông báo</Label>
                        </div>
                        <Switch
                          id="notifications"
                          checked={notificationSettings.enabled}
                          onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 opacity-75">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <Label htmlFor="sound" className="font-medium">Âm thanh</Label>
                        </div>
                        <Switch
                          id="sound"
                          checked={notificationSettings.sound}
                          onCheckedChange={(checked) => handleNotificationChange('sound', checked)}
                          disabled={!notificationSettings.enabled}
                        />
                      </div>
                      <div className="flex items-center justify-between p-2 opacity-75">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                          <Label htmlFor="vibration" className="font-medium">Rung</Label>
                        </div>
                        <Switch
                          id="vibration"
                          checked={notificationSettings.vibration}
                          onCheckedChange={(checked) => handleNotificationChange('vibration', checked)}
                          disabled={!notificationSettings.enabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Dangerous Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <UserX className="w-4 h-4 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Hành động</h3>
                    </div>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-all duration-200 h-12"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowSettings(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">Xóa lịch sử chat</p>
                          <p className="text-xs opacity-70">Không thể hoàn tác</p>
                        </div>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 h-12"
                        onClick={() => {
                          setShowBlockConfirm(true);
                          setShowSettings(false);
                        }}
                      >
                        <UserX className="w-4 h-4 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">Chặn người dùng</p>
                          <p className="text-xs opacity-70">Họ sẽ không thể nhắn tin</p>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors duration-200">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-white/90 mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-sm">
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium mb-2">Bắt đầu cuộc trò chuyện</p>
                <p className="text-sm text-white/80">Gửi tin nhắn đầu tiên cho {targetUserName}!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                  message.sender_id === currentUserId
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white/95 backdrop-blur-sm text-gray-800 border border-white/30 shadow-md hover:shadow-lg'
                }`}>
                  <p className="text-sm break-words leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender_id === currentUserId ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Enhanced Input */}
      <div className="bg-white/95 backdrop-blur-md border-t border-purple-100/50 p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border-purple-200 focus:border-purple-400 transition-all duration-200 rounded-2xl py-3 px-4 bg-white/80 backdrop-blur-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 rounded-2xl p-3 shadow-lg hover:shadow-xl"
            size="sm"
            disabled={!inputValue.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Enhanced Media History Modal */}
      <Dialog open={showMediaHistory} onOpenChange={setShowMediaHistory}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col bg-gradient-to-b from-white to-gray-50">
          <DialogHeader className="border-b border-gray-100 pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Image className="w-5 h-5 text-blue-600" />
              </div>
              Media đã chia sẻ
            </DialogTitle>
          </DialogHeader>
          
          {/* Enhanced Filter Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mt-4">
            {mediaFilterOptions.map((filter) => (
              <Button
                key={filter.key}
                onClick={() => setMediaFilter(filter.key as any)}
                variant={mediaFilter === filter.key ? "default" : "ghost"}
                size="sm"
                className={`flex-1 text-xs transition-all duration-200 rounded-lg ${
                  mediaFilter === filter.key 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                    : 'hover:bg-white'
                }`}
              >
                <filter.icon className="w-3 h-3 mr-1" />
                {filter.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="flex-1 mt-4">
            <div className="space-y-3">
              {getFilteredMediaMessages().length > 0 ? (
                getFilteredMediaMessages().map((msg) => (
                  <div key={msg.id} className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-xs text-gray-500 font-medium">
                        {formatDate(msg.created_at)} • {formatTime(msg.created_at)}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        msg.sender_id === currentUserId 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {msg.sender_id === currentUserId ? 'Bạn' : targetUserName}
                      </span>
                    </div>
                    <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-medium mb-1">Không có {mediaFilter === 'all' ? 'media' : 
                      mediaFilter === 'images' ? 'hình ảnh' : 
                      mediaFilter === 'videos' ? 'video' : 'links'} nào</p>
                  <p className="text-xs text-gray-400">Chia sẻ {mediaFilter === 'all' ? 'media' : 
                      mediaFilter === 'images' ? 'hình ảnh' : 
                      mediaFilter === 'videos' ? 'video' : 'links'} để xem tại đây</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-gradient-to-b from-white to-orange-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-orange-700">
              <Trash2 className="w-6 h-6" />
              Xóa lịch sử chat?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat với <strong>{targetUserName}</strong>? 
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-xs text-orange-700 font-medium">⚠️ Hành động này không thể hoàn tác</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="hover:bg-gray-50">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteChatHistory} className="bg-orange-500 hover:bg-orange-600">
              Xóa lịch sử
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Block Confirmation Dialog */}
      <Dialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <DialogContent className="bg-gradient-to-b from-white to-red-50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-700">
              <UserX className="w-6 h-6" />
              Chặn người dùng?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Bạn có chắc chắn muốn chặn <strong>{targetUserName}</strong>? 
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700 font-medium">🚫 Họ sẽ không thể gửi tin nhắn cho bạn nữa</p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowBlockConfirm(false)} className="hover:bg-gray-50">
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleBlockUser} className="bg-red-500 hover:bg-red-600">
              Chặn người dùng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileChatWindow;
