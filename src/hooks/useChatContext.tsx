
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatContextType {
  activeChatUser: ChatUser | null;
  isChatOpen: boolean;
  isFullScreen: boolean;
  openChat: (user: ChatUser) => void;
  closeChat: () => void;
  toggleFullScreen: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const openChat = useCallback((user: ChatUser) => {
    setActiveChatUser(user);
    setIsChatOpen(true);
    setIsFullScreen(false);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    setActiveChatUser(null);
    setIsFullScreen(false);
  }, []);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  return (
    <ChatContext.Provider value={{
      activeChatUser,
      isChatOpen,
      isFullScreen,
      openChat,
      closeChat,
      toggleFullScreen
    }}>
      {children}
    </ChatContext.Provider>
  );
};
