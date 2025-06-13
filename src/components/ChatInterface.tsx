import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Settings, Users, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiService, AIMessage } from '@/services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'stranger';
  timestamp: Date;
  isAI?: boolean;
}

interface ChatInterfaceProps {
  user?: any;
}

const ChatInterface = ({ user }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [stranger, setStranger] = useState<any>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('friendly');
  const [conversationHistory, setConversationHistory] = useState<AIMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Add to conversation history for AI
    const userMessage: AIMessage = {
      role: 'user',
      content: inputValue
    };
    setConversationHistory(prev => [...prev, userMessage]);
    setInputValue('');

    if (isAIMode) {
      // Show typing indicator
      setIsTyping(true);
      
      try {
        await aiService.simulateTyping();
        const aiResponse = await aiService.generateResponse(
          [...conversationHistory, userMessage],
          aiPersonality
        );

        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.message,
          sender: 'stranger',
          timestamp: new Date(),
          isAI: true
        };

        setMessages(prev => [...prev, response]);
        
        // Add AI response to conversation history
        setConversationHistory(prev => [...prev, userMessage, {
          role: 'assistant',
          content: aiResponse.message
        }]);
        
      } catch (error) {
        console.error('AI response error:', error);
        // Fallback response
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Xin lỗi, mình đang gặp chút vấn đề. Bạn có thể thử lại không? 😅',
          sender: 'stranger',
          timestamp: new Date(),
          isAI: true
        };
        setMessages(prev => [...prev, fallbackResponse]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Simulate stranger response (for demo)
      setTimeout(() => {
        const responses = [
          "Hey! Nice to meet you 😊",
          "What's your favorite thing to do on weekends?",
          "I love your energy! Tell me about yourself",
          "That's interesting! I've never thought about it that way",
          "Haha, you seem fun to talk to! 😄"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: 'stranger',
          timestamp: new Date(),
          isAI: false
        };

        setMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const startSearching = () => {
    setIsSearching(true);
    setMessages([]);
    setConversationHistory([]);
    
    // Simulate searching for 3 seconds, then connect to AI
    setTimeout(() => {
      setIsSearching(false);
      setIsConnected(true);
      setIsAIMode(true);
      setStranger({
        name: "Minh",
        age: 22,
        gender: "female",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      });

      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Chào bạn! Tôi là Minh, 22 tuổi. Rất vui được chat với bạn! 😊",
        sender: 'stranger',
        timestamp: new Date(),
        isAI: true
      };

      setMessages([welcomeMessage]);
      setConversationHistory([{
        role: 'assistant',
        content: welcomeMessage.text
      }]);
    }, 3000);
  };

  const disconnect = () => {
    setIsConnected(false);
    setIsAIMode(false);
    setStranger(null);
    setMessages([]);
    setConversationHistory([]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
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
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && !isSearching && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 text-center bg-white/70 backdrop-blur-sm border-purple-200 animate-scale-in">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sẵn sàng kết nối?</h2>
            <p className="text-gray-600 mb-6">Tìm kiếm những người bạn mới thú vị để trò chuyện cùng!</p>
            <Button 
              onClick={startSearching}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Bắt đầu chat
            </Button>
          </Card>
        </div>
      )}

      {/* Searching */}
      {isSearching && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 text-center bg-white/70 backdrop-blur-sm border-purple-200">
            <div className="animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang tìm kiếm...</h2>
            <p className="text-gray-600 mb-4">Đang kết nối bạn với AI thông minh</p>
            <div className="flex justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chat Interface */}
      {isConnected && stranger && (
        <>
          {/* Stranger Info */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-3">
            <div className="flex items-center gap-3">
              <img 
                src={stranger.avatar} 
                alt={stranger.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{stranger.name}, {stranger.age}</span>
                  {isAIMode && (
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
              <Button variant="outline" size="sm" onClick={disconnect}>
                Ngắt kết nối
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-purple-100 shadow-md'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
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

          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-purple-100 p-4">
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
        </>
      )}
    </div>
  );
};

export default ChatInterface;
