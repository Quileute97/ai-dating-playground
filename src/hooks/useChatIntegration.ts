
import { useCallback } from 'react';
import { useChatContext } from './useChatContext';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

export const useChatIntegration = () => {
  const { openChat } = useChatContext();

  const startChatWith = useCallback((user: ChatUser) => {
    openChat({
      id: user.id,
      name: user.name,
      avatar: user.avatar || '/placeholder.svg'
    });
  }, [openChat]);

  return { startChatWith };
};
