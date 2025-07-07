
import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

interface ChatHeaderProps {
  user: ChatUser;
  onClose: () => void;
  onToggleFullScreen: () => void;
}

export default function ChatHeader({ user, onClose, onToggleFullScreen }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative">
          <img 
            src={user.avatar || '/placeholder.svg'} 
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" 
            alt={user.name}
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
        <div className="min-w-0">
          <div className="font-medium text-sm truncate text-gray-900">{user.name}</div>
          <div className="text-xs text-green-600 font-medium">Đang hoạt động</div>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFullScreen}
          className="text-gray-500 hover:bg-gray-100 p-1 h-auto rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          title="Mở rộng toàn màn hình"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-500 hover:bg-gray-100 p-1 h-auto rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          title="Đóng chat"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
