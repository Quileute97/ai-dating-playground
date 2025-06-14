
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contact';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

interface NearbyChatWindowProps {
  user: NearbyUser;
  onClose: () => void;
}

const NearbyChatWindow = ({ user, onClose }: NearbyChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Chào bạn! Tôi thấy chúng ta ở gần nhau. Rất vui được làm quen! 😊`,
      sender: 'contact',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'read'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Simulate contact typing and response
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        "Wow, bạn ở gần đây thật! Có muốn đi uống cà phê không? ☕",
        "Haha, thú vị quá! Bạn thường hay đi đâu chơi vậy? 🤔",
        "Mình cũng đang ở quanh khu này! Có gì hay ho không? 😄",
        "Nghe hay đấy! Mình cũng thích khu này lắm 😊",
        "Bạn có thích đi khám phá những quán mới không? 🍕"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'contact',
        timestamp: new Date(),
        status: 'read'
      };

      setMessages(prev => [...prev, response]);
      setIsTyping(false);

      // Update message status to delivered after a delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'delivered' as const }
              : msg
          )
        );
      }, 1000);

      // Update to read after another delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'read' as const }
              : msg
          )
        );
      }, 2000);
    }, 1500 + Math.random() * 2000);
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Tính năng video call sẽ được triển khai trong phiên bản tiếp theo!",
    });
  };

  const handleVoiceCall = () => {
    toast({
      title: "Voice Call", 
      description: "Tính năng gọi thoại sẽ được triển khai trong phiên bản tiếp theo!",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      case 'read':
        return '✓✓';
      default:
        return '';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
          />
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800">{user.name}, {user.age}</h2>
            <div className="flex items-center gap-1">
              {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
              <span className="text-xs text-gray-500">
                {isTyping ? 'Đang nhập...' : user.isOnline ? 'Đang online' : user.lastSeen}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleVoiceCall}>
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleVideoCall}>
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-200 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-purple-100 shadow-md'
              }`}>
                <p className="text-sm break-words">{message.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${
                    message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.sender === 'user' && (
                    <span className={`text-xs ml-2 ${
                      message.status === 'read' ? 'text-blue-200' : 'text-purple-200'
                    }`}>
                      {getStatusIcon(message.status)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white/80 backdrop-blur-sm border border-purple-100 px-4 py-2 rounded-2xl shadow-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-purple-100 p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border-purple-200 focus:border-purple-400 transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            size="sm"
            disabled={isTyping || !inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NearbyChatWindow;
