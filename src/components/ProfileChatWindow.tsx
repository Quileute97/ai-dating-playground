import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical, Settings, Image, Palette, History } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Predefined background options
  const backgroundOptions = [
    { name: 'Mặc định', value: '' },
    { name: 'Đêm sao', value: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=800&h=600&fit=crop' },
    { name: 'Rừng vàng', value: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=600&fit=crop' },
    { name: 'Hồ nước', value: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop' },
    { name: 'Phòng khách', value: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop' }
  ];

  // Load saved background from localStorage
  useEffect(() => {
    const savedBg = localStorage.getItem(`chat-bg-${targetUserId}`);
    if (savedBg) {
      setChatBackground(savedBg);
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

  const handleBackgroundChange = (bgValue: string) => {
    setChatBackground(bgValue);
    localStorage.setItem(`chat-bg-${targetUserId}`, bgValue);
    toast({
      title: "Đã thay đổi ảnh nền",
      description: "Ảnh nền chat đã được cập nhật",
    });
  };

  const getMediaMessages = () => {
    // Filter messages that might contain media (for demo purposes, we'll show all messages)
    // In a real app, you'd filter for messages with image/video attachments
    return messages.filter(msg => msg.content.includes('http') || msg.content.includes('image') || msg.content.includes('video'));
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col z-50"
      style={{
        background: chatBackground 
          ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${chatBackground}) center/cover`
          : 'linear-gradient(to bottom right, rgb(239 246 255), rgb(250 245 255), rgb(239 246 255))'
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
              <SheetContent side="right" className="w-80">
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
                      Xem lại hình ảnh/video đã chia sẻ
                    </Button>
                  </div>

                  {/* Background Settings Section */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Ảnh nền chat
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {backgroundOptions.map((bg) => (
                        <Button
                          key={bg.value}
                          onClick={() => {
                            handleBackgroundChange(bg.value);
                            setShowSettings(false);
                          }}
                          variant={chatBackground === bg.value ? "default" : "outline"}
                          className="w-full justify-start h-12"
                        >
                          <div 
                            className="w-8 h-8 rounded border-2 border-gray-300 mr-3"
                            style={{
                              background: bg.value 
                                ? `url(${bg.value}) center/cover` 
                                : 'linear-gradient(45deg, #e5e7eb, #f3f4f6)'
                            }}
                          />
                          {bg.name}
                          {chatBackground === bg.value && <span className="ml-auto text-purple-600">✓</span>}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Cài đặt khác</h3>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toast({ title: "Thông báo", description: "Tính năng đang được phát triển!" })}
                      >
                        🔔 Cài đặt thông báo
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toast({ title: "Chặn người dùng", description: "Tính năng đang được phát triển!" })}
                      >
                        🚫 Chặn người dùng
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => toast({ title: "Xóa lịch sử", description: "Tính năng đang được phát triển!" })}
                      >
                        🗑️ Xóa lịch sử chat
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Hình ảnh & Video đã chia sẻ
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {getMediaMessages().length > 0 ? (
              getMediaMessages().map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    {formatTime(msg.created_at)}
                  </p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Image className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có hình ảnh hoặc video nào được chia sẻ</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileChatWindow;
