import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Settings, Users, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiService, AIMessage } from '@/services/aiService';
import StrangerSettingsModal from './StrangerSettingsModal';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'stranger';
  timestamp: Date;
  isAI?: boolean;
}

interface ChatInterfaceProps {
  user?: any;
  isAdminMode?: boolean;
  matchmaking?: any;
  anonId?: string; // Thêm prop mới
}

interface StrangerSettings {
  gender: string;
  ageGroup: string;
}

const PING_SOUND_URL = "/ping.mp3"; // Dùng file ở public thư mục, nếu chưa có thì dùng URL gốc ngoài

const ChatInterface = ({ user, isAdminMode = false, matchmaking, anonId }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [stranger, setStranger] = useState<any>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [aiPersonality, setAiPersonality] = useState('friendly');
  const [conversationHistory, setConversationHistory] = useState<AIMessage[]>([]);
  const [showStrangerSettings, setShowStrangerSettings] = useState(false);
  const [strangerSettings, setStrangerSettings] = useState<StrangerSettings>({
    gender: 'all',
    ageGroup: 'all'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasNotified, setHasNotified] = useState(false);
  const [isStartingQueue, setIsStartingQueue] = useState(false); // NEW
  const prevIsMatchedRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const matchmakingStatus = matchmaking?.isInQueue ? 'searching' : matchmaking?.isMatched ? 'matched' : 'idle';
  const matchResult = {
    conversationId: matchmaking?.conversationId,
    partnerId: matchmaking?.partnerId
  };

  const generateStrangerProfile = (settings: StrangerSettings) => {
    const profiles = {
      male: {
        gen_z: [
          { name: "Minh", age: 22, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face" },
          { name: "Tuấn", age: 24, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" }
        ],
        millennial: [
          { name: "Hoàng", age: 28, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face" },
          { name: "Nam", age: 32, avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face" }
        ]
      },
      female: {
        gen_z: [
          { name: "Linh", age: 21, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face" },
          { name: "Mai", age: 23, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face" }
        ],
        millennial: [
          { name: "Hương", age: 29, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face" },
          { name: "Thảo", age: 31, avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face" }
        ]
      }
    };

    if (settings.gender === 'all') {
      const allProfiles = [...(profiles.male[settings.ageGroup] || []), ...(profiles.female[settings.ageGroup] || [])];
      return allProfiles[Math.floor(Math.random() * allProfiles.length)];
    }

    const genderProfiles = profiles[settings.gender as keyof typeof profiles];
    if (!genderProfiles) return profiles.female.gen_z[0]; // fallback

    const ageProfiles = genderProfiles[settings.ageGroup as keyof typeof genderProfiles];
    if (!ageProfiles) return profiles.female.gen_z[0]; // fallback

    return ageProfiles[Math.floor(Math.random() * ageProfiles.length)];
  };

  // startSearching: chỉ gọi matchmaking.startQueue() với userId hoặc anonId
  const startSearching = async () => {
    const realUserId = user?.id || anonId;
    console.log("[CHAT] Bấm Bắt đầu chat - user?.id:", user?.id, "| anonId:", anonId, "| realUserId:", realUserId);
    setMessages([]);
    setConversationHistory([]);
    setIsAIMode(false);
    if (matchmaking?.startQueue && realUserId) {
      try {
        setIsStartingQueue(true); // đánh dấu đang xử lý
        console.log("[CHAT] Gọi matchmaking.startQueue với realUserId", realUserId);
        await matchmaking.startQueue(realUserId);
      } catch (err) {
        console.log("[CHAT] Lỗi khi startQueue:", err);
      } finally {
        setIsStartingQueue(false); // luôn enable lại dù lỗi hay thành công
      }
    } else {
      console.log("[CHAT] Không thể startQueue vì thiếu userId/anonId");
    }
  };

  // Trước khi render, log trạng thái disable button để debug
  const disableStartBtn = !(user?.id || anonId) || isStartingQueue;
  useEffect(() => {
    console.log("[CHAT] Trạng thái disable nút Bắt đầu chat:", disableStartBtn, "| user?.id:", user?.id, "| anonId:", anonId);
  }, [user?.id, anonId, isStartingQueue]);

  // Khi bấm ngắt kết nối
  const disconnect = async () => {
    setStranger(null);
    setMessages([]);
    setConversationHistory([]);
    setIsTyping(false);
    if (matchmaking?.reset) await matchmaking.reset();
  };

  // Theo dõi trạng thái ghép đôi (matchmakingStatus)
  useEffect(() => {
    const isNowMatched =
      matchmaking?.isMatched &&
      matchmaking?.partnerId &&
      matchmaking?.conversationId;

    const wasMatched = prevIsMatchedRef.current;

    // DEBUG: Luôn log mọi lần matched
    console.log("[PATCH][Hook] useEffect MATCH:", {
      isNowMatched,
      wasMatched,
      status: matchmakingStatus,
      partnerId: matchmaking?.partnerId,
      conversationId: matchmaking?.conversationId,
      stranger,
    });

    // Nếu matched và stranger chưa set, hoặc info không đồng bộ, ép set stranger lại
    if (
      isNowMatched &&
      (!stranger ||
        stranger.name !== "Người lạ" ||
        stranger.age !== "?" ||
        stranger.avatar !== null)
    ) {
      setStranger({
        name: "Người lạ",
        age: "?",
        avatar: null,
      });
      setMessages([
        {
          id: Date.now().toString(),
          text: `Bạn đã được kết nối với 1 người lạ. Hãy bắt đầu trò chuyện!`,
          sender: "stranger",
          timestamp: new Date(),
        },
      ]);
      console.log("[PATCH][useEffect] ĐÃ FORCED SET STRANGER sau khi matched!");
    }

    // Reset khi disconnect
    if (!isNowMatched && wasMatched) {
      setStranger(null);
      setMessages([]);
      console.log("[PATCH][useEffect] ĐÃ RESET STRANGER sau disconnect!");
    }

    prevIsMatchedRef.current = !!isNowMatched;
  }, [
    matchmaking?.isMatched,
    matchmaking?.partnerId,
    matchmaking?.conversationId,
    matchmakingStatus, // ép chạy lại nếu status đổi
  ]);

  // Hiệu ứng phát âm thanh và hiện toast khi matched (kể cả khi user đang ở tab khác)
  useEffect(() => {
    if (
      matchmakingStatus === "matched" &&
      matchResult.conversationId &&
      matchResult.partnerId &&
      !hasNotified
    ) {
      toast({
        title: "🔔 Đã kết nối với người lạ!",
        description: "Bạn đã được ghép nối thành công. Quay lại Tab Chat để bắt đầu trò chuyện!",
      });
      if (!audioRef.current) {
        audioRef.current = new window.Audio(PING_SOUND_URL);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {}); // Ignore play error (browser lock)
      setHasNotified(true);
    }
    if (matchmakingStatus !== "matched" && hasNotified) {
      setHasNotified(false);
    }
  }, [matchmakingStatus, matchResult, hasNotified, toast]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    const userMessage: AIMessage = {
      role: 'user',
      content: inputValue
    };
    setConversationHistory(prev => [...prev, userMessage]);
    setInputValue('');

    if (isAIMode) {
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
        setConversationHistory(prev => [...prev, userMessage, {
          role: 'assistant',
          content: aiResponse.message
        }]);
      } catch (error) {
        console.error('AI response error:', error);
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
    }
  };

  const handleApplyStrangerSettings = (settings: StrangerSettings) => {
    setStrangerSettings(settings);
    toast({
      title: "Cài đặt đã lưu",
      description: `Sẽ tìm kiếm ${settings.gender === 'all' ? 'tất cả giới tính' : settings.gender === 'male' ? 'nam' : settings.gender === 'female' ? 'nữ' : 'khác'}, ${settings.ageGroup === 'all' ? 'mọi độ tuổi' : settings.ageGroup === 'gen-z' ? 'Gen Z' : settings.ageGroup === 'millennial' ? '9x' : 'trên 35'}`,
    });
  };

  useEffect(() => {
    console.log("[DEBUG][ChatInterface render]", {
      isMatched: matchmaking?.isMatched,
      partnerId: matchmaking?.partnerId,
      conversationId: matchmaking?.conversationId,
      matchmakingStatus,
      messages,
      stranger,
    });
  });

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* DEBUG PATCH: Nếu đã matched mà stranger vẫn null, show cảnh báo UI */}
      {(matchmakingStatus === "matched" && !stranger) && (
        <div className="bg-yellow-100 text-yellow-800 text-center py-4">
          <b>⚠️ Đã matched thành công nhưng UI không hiện chat! Patch này báo lỗi để giúp debug.</b>
          <br />
          partnerId: {matchmaking?.partnerId?.toString() || "null"}, &nbsp;
          conversationId: {matchmaking?.conversationId?.toString() || "null"}
        </div>
      )}

      {/* Optionally preload the sound */}
      <audio ref={audioRef} src={PING_SOUND_URL} preload="auto" style={{display:'none'}} />
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowStrangerSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Connection Status (Chỉ hiện nếu chưa matched & chưa searching) */}
      {(matchmakingStatus !== "matched" && matchmakingStatus !== "searching") && (
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
              disabled={disableStartBtn}
            >
              {isStartingQueue ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                  Đang bắt đầu...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bắt đầu chat
                </>
              )}
            </Button>
            {!(user?.id || anonId) && (
              <p className="text-xs text-gray-500 mt-2">Vui lòng đăng nhập hoặc tiếp tục dưới dạng khách để bắt đầu chat</p>
            )}
          </Card>
        </div>
      )}

      {/* Searching Status */}
      {matchmakingStatus === "searching" && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 text-center bg-white/70 backdrop-blur-sm border-purple-200">
            <div className="animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang tìm kiếm người lạ...</h2>
            <p className="text-gray-600 mb-4">Nếu chưa có ai, bạn sẽ là người đầu tiên trong hàng chờ.</p>
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

      {/* Chat UI khi đã được match */}
      {matchmakingStatus === "matched" && stranger && (
        <>
          {/* Stranger Info */}
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
                  {/* Only show AI badge for admin */}
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
      
      <StrangerSettingsModal
        isOpen={showStrangerSettings}
        onClose={() => setShowStrangerSettings(false)}
        onApply={handleApplyStrangerSettings}
        currentSettings={strangerSettings}
      />
    </div>
  );
};

export default ChatInterface;
