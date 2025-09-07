import React from 'react';
import RealTimeActivityPanel from './RealTimeActivityPanel';

interface NotificationsTabProps {
  userId: string;
}

export default function NotificationsTab({ userId }: NotificationsTabProps) {
  return (
    <div className="flex-1 flex flex-col bg-white lg:hidden">
      <div className="flex-1 overflow-hidden p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Thông báo</h2>
        <div className="w-full">
          <RealTimeActivityPanel userId={userId} />
        </div>
      </div>
    </div>
  );
}