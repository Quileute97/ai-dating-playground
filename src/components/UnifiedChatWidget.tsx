
import React from 'react';
import { Card } from '@/components/ui/card';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useChatContext } from '@/hooks/useChatContext';
import ProfileChatWindow from './ProfileChatWindow';
import ChatHeader from './chat/ChatHeader';
import ChatMessages from './chat/ChatMessages';
import ChatInput from './chat/ChatInput';

interface UnifiedChatWidgetProps {
  myUserId: string;
}

export default function UnifiedChatWidget({ myUserId }: UnifiedChatWidgetProps) {
  const { activeChatUser, isChatOpen, isFullScreen, closeChat, toggleFullScreen } = useChatContext();
  
  const { messages, isLoading, sendMessage, sending } = useRealTimeMessages(
    myUserId, 
    activeChatUser?.id || ''
  );

  if (!isChatOpen || !activeChatUser) return null;

  // Full screen mode - use ProfileChatWindow
  if (isFullScreen) {
    return (
      <ProfileChatWindow
        targetUserId={activeChatUser.id}
        targetUserName={activeChatUser.name}
        targetUserAvatar={activeChatUser.avatar}
        currentUserId={myUserId}
        onClose={toggleFullScreen}
      />
    );
  }

  // Small widget mode
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden">
        <ChatHeader 
          user={activeChatUser}
          onClose={closeChat}
          onToggleFullScreen={toggleFullScreen}
        />
        
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          myUserId={myUserId}
          activeChatUser={activeChatUser}
        />
        
        <ChatInput
          onSendMessage={sendMessage}
          sending={sending}
        />
      </Card>
    </div>
  );
}
