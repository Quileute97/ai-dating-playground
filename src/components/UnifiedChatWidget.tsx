
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

  // Early return if no chat is open or no active user
  if (!isChatOpen || !activeChatUser) {
    return null;
  }

  // Full screen mode - use ProfileChatWindow with error boundary
  if (isFullScreen) {
    try {
      return (
        <ProfileChatWindow
          targetUserId={activeChatUser.id}
          targetUserName={activeChatUser.name}
          targetUserAvatar={activeChatUser.avatar}
          currentUserId={myUserId}
          onClose={toggleFullScreen}
        />
      );
    } catch (error) {
      console.error('Error rendering ProfileChatWindow:', error);
      // Fallback to small widget mode
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 text-center text-red-500">
              <p>Lỗi hiển thị chat toàn màn hình</p>
              <button 
                onClick={toggleFullScreen}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Quay về chế độ nhỏ
              </button>
            </div>
          </Card>
        </div>
      );
    }
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
