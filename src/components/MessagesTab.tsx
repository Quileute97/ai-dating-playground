import React from 'react';
import ActiveFriendsWithChatPanel from './ActiveFriendsWithChatPanel';

interface MessagesTabProps {
  userId: string;
}

export default function MessagesTab({ userId }: MessagesTabProps) {
  return (
    <div className="flex-1 flex flex-col bg-white lg:hidden">
      <div className="flex-1 overflow-hidden p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Tin nhắn</h2>
        <div className="w-full">
          <ActiveFriendsWithChatPanel
            myId={userId}
            selectedChatUserId={undefined}
            onChatUserChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}