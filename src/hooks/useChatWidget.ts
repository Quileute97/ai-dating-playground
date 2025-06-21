
import { useState, useCallback } from 'react';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatUser, setChatUser] = useState<ChatUser | null>(null);

  const openChat = useCallback((user: ChatUser) => {
    setChatUser(user);
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setChatUser(null);
  }, []);

  return {
    isOpen,
    chatUser,
    openChat,
    closeChat
  };
}
