
import React from 'react';
import { Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onOpenSettings: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onOpenSettings }) => (
  <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-4 shadow-sm animate-fade-in">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-800">Chat với người lạ</h1>
          <p className="text-sm text-gray-500">Kết nối và trò chuyện ngẫu nhiên</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onOpenSettings}
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export default ChatHeader;
