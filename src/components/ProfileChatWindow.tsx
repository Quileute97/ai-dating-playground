
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { supabase } from "@/integrations/supabase/client";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col z-50">
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
            <div className="text-center text-gray-500 mt-8">
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
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-purple-100 shadow-md'
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
    </div>
  );
};

export default ProfileChatWindow;
