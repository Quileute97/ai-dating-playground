
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  isTyping: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputValue,
  setInputValue,
  onSend,
  disabled,
  isTyping,
}) => (
  <div className="bg-white/80 backdrop-blur-sm border-t border-purple-100 p-4">
    <div className="flex gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="flex-1 border-purple-200 focus:border-purple-400 transition-colors"
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
        disabled={isTyping || disabled}
      />
      <Button
        onClick={onSend}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
        size="sm"
        disabled={isTyping || !inputValue.trim() || disabled}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export default MessageInput;
