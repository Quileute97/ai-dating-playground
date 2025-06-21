
import { useState, useCallback } from 'react';

export function useChatUserSelection() {
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);

  const selectUserForChat = useCallback((userId: string) => {
    setSelectedChatUserId(userId);
  }, []);

  const clearChatSelection = useCallback(() => {
    setSelectedChatUserId(null);
  }, []);

  return {
    selectedChatUserId,
    selectUserForChat,
    clearChatSelection
  };
}
