import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminUserChatModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
}

interface Conversation {
  id: string;
  user_real_id: string;
  real_user_profile: {
    name: string;
    avatar: string;
    age: number;
    gender: string;
  };
  last_message: string;
  last_message_at: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  created_at: string;
}

const AdminUserChatModal: React.FC<AdminUserChatModalProps> = ({
  isOpen,
  user,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch conversations for this fake user
  const fetchConversations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        user_real_id,
        last_message,
        last_message_at
      `)
      .eq('user_fake_id', user.id)
      .order('last_message_at', { ascending: false });

    if (error) {
      toast({
        title: "Lỗi tải hội thoại",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Fetch profile info for each conversation
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar, age, gender')
            .eq('id', conv.user_real_id)
            .single();
          
          return {
            ...conv,
            real_user_profile: profile || {
              name: 'Unknown User',
              avatar: '/placeholder.svg',
              age: 0,
              gender: 'unknown'
            }
          };
        })
      );
      
      setConversations(conversationsWithProfiles);
    }
    setLoading(false);
  };

  // Fetch messages for active conversation
  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Lỗi tải tin nhắn",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setMessages(data || []);
    }
  };

  // Send message as fake user
  const handleSendMessage = async () => {
    if (!activeConversation || !newMessage.trim() || sending) return;
    
    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation.id,
        sender: 'fake',
        content: newMessage.trim(),
        sender_id: user.id
      });

    if (error) {
      toast({
        title: "Lỗi gửi tin nhắn",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewMessage('');
      fetchMessages(activeConversation.id);
      fetchConversations(); // Update last message
    }
    setSending(false);
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchConversations();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Quản lý tin nhắn - {user.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r pr-4">
            <h3 className="font-semibold mb-4">Hội thoại ({conversations.length})</h3>
            <ScrollArea className="h-full">
              {loading ? (
                <div className="text-center py-4">Đang tải...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Chưa có hội thoại nào
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeConversation?.id === conv.id
                          ? 'bg-blue-100 border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setActiveConversation(conv)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={conv.real_user_profile.avatar || '/placeholder.svg'}
                          alt={conv.real_user_profile.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conv.real_user_profile.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.last_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 pl-4 flex flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={activeConversation.real_user_profile.avatar || '/placeholder.svg'}
                      alt={activeConversation.real_user_profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">
                        {activeConversation.real_user_profile.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {activeConversation.real_user_profile.age} tuổi • 
                        {activeConversation.real_user_profile.gender === 'female' ? ' Nữ' : ' Nam'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === 'fake' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender === 'fake'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'fake' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                  >
                    {sending ? 'Đang gửi...' : 'Gửi'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Chọn hội thoại để bắt đầu nhắn tin
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUserChatModal;