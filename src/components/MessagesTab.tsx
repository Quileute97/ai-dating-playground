import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Crown, Lock, Image as ImageIcon, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConversationsList } from '@/hooks/useConversationsList';
import FullScreenChat from './FullScreenChat';
import { format, isToday, isYesterday } from 'date-fns';
import { usePremiumStatus } from '@/hooks/usePremiumStatus';
import PremiumUpgradeModal from './PremiumUpgradeModal';

interface MessagesTabProps {
  userId: string;
  selectedUserId?: string | null;
}

export default function MessagesTab({ userId, selectedUserId }: MessagesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    userAvatar: string;
  } | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  const { data: conversations, isLoading } = useConversationsList(userId);
  const { premiumStatus, refetch: refetchPremiumStatus } = usePremiumStatus(userId);
  const isPremium = premiumStatus.isPremium;

  // Auto-open chat if selectedUserId is provided
  React.useEffect(() => {
    if (selectedUserId && conversations) {
      const conversation = conversations.find(
        c => c.other_user?.id === selectedUserId
      );
      if (conversation) {
        setSelectedChat({
          userId: conversation.other_user.id,
          userName: conversation.other_user.name,
          userAvatar: conversation.other_user.avatar
        });
      } else {
        // Create a new chat if no conversation exists
        import('@/integrations/supabase/client').then(async ({ supabase }) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, name, avatar')
            .eq('id', selectedUserId)
            .single();

          if (profileData) {
            setSelectedChat({
              userId: profileData.id,
              userName: profileData.name || 'Unknown',
              userAvatar: profileData.avatar || '/placeholder.svg'
            });
          }
        });
      }
    }
  }, [selectedUserId, conversations]);
  
  const FREE_CHAT_LIMIT = 5;

  const handleOpenChat = (conversation: any) => {
    setSelectedChat({
      userId: conversation.other_user.id,
      userName: conversation.other_user.name,
      userAvatar: conversation.other_user.avatar
    });
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const filteredConversations = conversations?.filter(conv => 
    conv.other_user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const visibleConversations = isPremium 
    ? filteredConversations 
    : filteredConversations.slice(0, FREE_CHAT_LIMIT);
  
  const lockedConversations = isPremium 
    ? [] 
    : filteredConversations.slice(FREE_CHAT_LIMIT);

  const formatLastMessageTime = (dateString: string | null) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Hôm qua';
    } else {
      return format(date, 'dd/MM');
    }
  };

  // Show fullscreen chat if a conversation is selected
  if (selectedChat) {
    return (
      <FullScreenChat
        currentUserId={userId}
        targetUserId={selectedChat.userId}
        targetUserName={selectedChat.userName}
        targetUserAvatar={selectedChat.userAvatar}
        onBack={handleBackToList}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-4 px-2 h-full flex flex-col animate-fade-in bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Tin nhắn</h2>
        </div>
        <div className="flex-1 p-4">
          <div className="text-center text-muted-foreground text-sm">
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 h-full flex flex-col animate-fade-in bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Tin nhắn</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào' : 'Chưa có tin nhắn nào'}
            </div>
          ) : (
            <>
              {/* Visible Conversations */}
              {visibleConversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="flex items-center p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleOpenChat(conversation)}
                >
                  <Avatar className="w-12 h-12 mr-3">
                    <AvatarImage src={conversation.other_user?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>
                      {conversation.other_user?.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium truncate">
                        {conversation.other_user?.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatLastMessageTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                      {conversation.last_message?.includes('📷') ? (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span>Đã gửi ảnh</span>
                        </>
                      ) : conversation.last_message?.includes('🎥') ? (
                        <>
                          <Video className="w-4 h-4" />
                          <span>Đã gửi video</span>
                        </>
                      ) : (
                        conversation.last_message || 'Chưa có tin nhắn'
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {/* Locked Conversations with Watermark */}
              {lockedConversations.length > 0 && (
                <div className="relative">
                  {/* Blurred Conversations */}
                  <div className="blur-sm pointer-events-none select-none">
                    {lockedConversations.map((conversation) => (
                      <div 
                        key={conversation.id} 
                        className="flex items-center p-4 opacity-60"
                      >
                        <Avatar className="w-12 h-12 mr-3">
                          <AvatarImage src={conversation.other_user?.avatar || '/placeholder.svg'} />
                          <AvatarFallback>
                            {conversation.other_user?.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium truncate">
                              {conversation.other_user?.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatLastMessageTime(conversation.last_message_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            {conversation.last_message?.includes('📷') ? (
                              <>
                                <ImageIcon className="w-4 h-4" />
                                <span>Đã gửi ảnh</span>
                              </>
                            ) : conversation.last_message?.includes('🎥') ? (
                              <>
                                <Video className="w-4 h-4" />
                                <span>Đã gửi video</span>
                              </>
                            ) : (
                              conversation.last_message || 'Chưa có tin nhắn'
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Premium Upgrade Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="text-center p-6 max-w-sm">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Còn {lockedConversations.length} tin nhắn nữa
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Nâng cấp Premium để xem toàn bộ tin nhắn và trò chuyện không giới hạn
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                        onClick={() => setShowPremiumModal(true)}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Nâng cấp Premium
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {
          setShowPremiumModal(false);
          refetchPremiumStatus();
        }}
        userId={userId}
      />
    </div>
  );
}