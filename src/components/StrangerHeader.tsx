
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StrangerHeaderProps {
  stranger: any;
  isAdminMode: boolean;
  isAIMode: boolean;
  isTyping: boolean;
  onDisconnect: () => void;
}

const StrangerHeader: React.FC<StrangerHeaderProps> = ({
  stranger,
  isAdminMode,
  isAIMode,
  isTyping,
  onDisconnect,
}) => (
  <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-3">
    <div className="flex items-center gap-3">
      {stranger.avatar ? (
        <img 
          src={stranger.avatar} 
          alt={stranger.name ?? 'Stranger'}
          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-purple-200 flex items-center justify-center text-gray-500">?</div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800">
            {stranger.name ? `${stranger.name}, ${stranger.age}` : 'Người lạ'}
          </span>
          {isAdminMode && isAIMode && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Bot className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">
            {isTyping ? 'Đang nhập...' : 'Đang online'}
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onDisconnect}>
        Ngắt kết nối
      </Button>
    </div>
  </div>
);

export default StrangerHeader;
