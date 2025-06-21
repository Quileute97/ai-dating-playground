
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Settings, Image, Palette, History, Bell, UserX, Trash2 } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Predefined background options
  const backgroundOptions = [
    { name: 'Mặc định', value: '', preview: 'linear-gradient(45deg, #e5e7eb, #f3f4f6)' },
    { name: 'Đêm sao', value: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop', preview: '' },
    { name: 'Rừng vàng', value: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop', preview: '' },
    { name: 'Hồ nước', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop', preview: '' },
    { name: 'Phòng khách', value: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop', preview: '' },
    { name: 'Gradient Tím', value: 'gradient-purple', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Gradient Xanh', value: 'gradient-blue', preview: 'linear-gradient(135deg, #667eea 0%, #43c6ac 100%)' },
    { name: 'Gradient Hồng', value: 'gradient-pink', preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
  ];

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
      title: "Đã thay đổi ảnh nền",
      description: "Ảnh nền chat đã được cập nhật",
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    localStorage.setItem(`chat-notifications-${targetUserId}`, JSON.stringify(newSettings));
    toast({
      title: "Cài đặt đã lưu",
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
        title: "Đã xóa lịch sử",
        description: "Tất cả tin nhắn đã được xóa",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa lịch sử chat",
        variant: "destructive",
      });
    }
  };

  const handleBlockUser = () => {
    // In a real app, this would update the database
    setShowBlockConfirm(false);
    toast({
      title: "Đã chặn người dùng",
      description: `${targetUserName} đã bị chặn`,
    });
    onClose();
  };

  const getChatBackgroundStyle = () => {
    if (!chatBackground) {
      return 'linear-gradient(to bottom right, rgb(239 246 255), rgb(250 245 255), rgb(239 246 255))';
    }
    
    if (chatBackground.startsWith('gradient-')) {
      const gradients = {
        'gradient-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #43c6ac 100%)',
        'gradient-pink': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      };
      return gradients[chatBackground as keyof typeof gradients];
    }
    
    return `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${chatBackground}) center/cover`;
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col z-50"
      style={{
        background: getChatBackgroundStyle()
      }}
    >
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <img 
            src={targetUserAvatar} 
            alt={targetUserName}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
          />
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">{targetUserName}</h2>
            <span className="text-xs text-gray-500">Đang online</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Video Call", description: "Tính năng sẽ được cập nhật!" })}>
              <Video className="w-4 h-4" />
            </Button>
            
            {/* Chat Settings Sheet */}
            <Sheet open={showSettings} onOpenChange={setShowSettings}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Cài đặt tin nhắn
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Media History Section */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Hình ảnh & Video
                    </h3>
                    <Button
                      onClick={() => {
                        setShowMediaHistory(true);
                        setShowSettings(false);
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Xem lại media đã chia sẻ ({getFilteredMediaMessages().length})
                    </Button>
                  </div>

                  {/* Background Settings Section */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Ảnh nền chat
                    </h3>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {backgroundOptions.map((bg) => (
                        <Button
                          key={bg.value}
                          onClick={() => {
                            handleBackgroundChange(bg.value);
                          }}
                          variant={chatBackground === bg.value ? "default" : "outline"}
                          className="w-full justify-start h-12"
                        >
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 mr-3"
                            style={{
                              background: bg.preview || (bg.value ? `url(${bg.value}) center/cover` : 'linear-gradient(45deg, #e5e7eb, #f3f4f6)')
                            }}
                          />
                          {bg.name}
                          {chatBackground === bg.value && <span className="ml-auto text-purple-600">✓</span>}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Thông báo
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notifications">Bật thông báo</Label>
                        <Switch
                          id="notifications"
                          checked={notificationSettings.enabled}
                          onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sound">Âm thanh</Label>
                        <Switch
                          id="sound"
                          checked={notificationSettings.sound}
                          onCheckedChange={(checked) => handleNotificationChange('sound', checked)}
                          disabled={!notificationSettings.enabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="vibration">Rung</Label>
                        <Switch
                          id="vibration"
                          checked={notificationSettings.vibration}
                          onCheckedChange={(checked) => handleNotificationChange('vibration', checked)}
                          disabled={!notificationSettings.enabled}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dangerous Actions */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Hành động</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-orange-600 hover:text-orange-700"
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowSettings(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa lịch sử chat
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={() => {
                          setShowBlockConfirm(true);
                          setShowSettings(false);
                        }}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Chặn người dùng
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-white/80 mt-8">
              <p>Bắt đầu cuộc trò chuyện với {targetUserName}!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-200 ${
                  message.sender_id === currentUserId
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-white/20 shadow-md'
                }`}>
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
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

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-purple-100 p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border-purple-200 focus:border-purple-400 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            size="sm"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Media History Modal */}
      <Dialog open={showMediaHistory} onOpenChange={setShowMediaHistory}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Media đã chia sẻ
            </DialogTitle>
          </DialogHeader>
          
          {/* Filter Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'images', label: 'Hình ảnh' },
              { key: 'videos', label: 'Video' },
              { key: 'links', label: 'Links' }
            ].map((filter) => (
              <Button
                key={filter.key}
                onClick={() => setMediaFilter(filter.key as any)}
                variant={mediaFilter === filter.key ? "default" : "ghost"}
                size="sm"
                className="flex-1 text-xs"
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-3">
              {getFilteredMediaMessages().length > 0 ? (
                getFilteredMediaMessages().map((msg) => (
                  <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs text-gray-500">
                        {formatDate(msg.created_at)} - {formatTime(msg.created_at)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        msg.sender_id === currentUserId 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {msg.sender_id === currentUserId ? 'Bạn' : targetUserName}
                      </span>
                    </div>
                    <p className="text-sm break-words">{msg.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Không có {mediaFilter === 'all' ? 'media' : 
                      mediaFilter === 'images' ? 'hình ảnh' : 
                      mediaFilter === 'videos' ? 'video' : 'links'} nào</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa lịch sử chat?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat với {targetUserName}? 
            Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteChatHistory}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chặn người dùng?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            Bạn có chắc chắn muốn chặn {targetUserName}? 
            Họ sẽ không thể gửi tin nhắn cho bạn nữa.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBlockConfirm(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleBlockUser}>
              Chặn
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileChatWindow;
