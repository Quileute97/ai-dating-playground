import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Settings, Users, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { aiService, AIMessage } from '@/services/aiService';
import StrangerSettingsModal from './StrangerSettingsModal';
import { supabase } from '@/integrations/supabase/client';

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
  anonId?: string;
}

interface StrangerSettings {
  gender: string;
  ageGroup: string;
}

const PING_SOUND_URL = "/ping.mp3";

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
  const [isStartingQueue, setIsStartingQueue] = useState(false);

  // New: State for loaded (realtime) messages & tracking current conversation
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Auto sync state từ matchmaking
  useEffect(() => {
    // Cập nhật conversationId khi tìm thấy match mới
    if (matchmaking?.isMatched && matchmaking?.conversationId) {
      setConversationId(matchmaking.conversationId);
    } else if (!matchmaking?.isMatched) {
      setConversationId(null);
    }
  }, [matchmaking?.isMatched, matchmaking?.conversationId]);

  // ====
  // New: Lắng nghe các message mới từ realtime
  useEffect(() => {
    if (!conversationId) return;

    // Realtime subscribe
    const channel = supabase
      .channel('realtime-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: any) => {
          if (payload.new) {
            const msg = payload.new;
            // Xác định sender dựa trên trường sender, vì không còn sender_id
            const senderUi: 'user' | 'stranger' =
              msg.sender === 'real' ? 'user' : 'stranger';

            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [
                ...prev,
                {
                  id: msg.id,
                  text: msg.content,
                  sender: senderUi,
                  timestamp: new Date(msg.created_at),
                },
              ];
            });
          }
        }
      )
      .subscribe();

    // Load history ban đầu
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!data) return;
      setMessages(
        data.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender === 'real' ? 'user' : 'stranger',
          timestamp: new Date(msg.created_at),
        }))
      );
    })();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, [conversationId, user?.id]);

  // =====
  // New: Thay đổi hàm gửi message → lưu vào table messages trên Supabase
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !conversationId || !user?.id) return;

    const newMessageText = inputValue.trim();
    setInputValue('');

    // Hiện tại: chỉ gửi message nếu có conversationId (đã match)
    // Lưu message lên Supabase
    // sender: 'real', sender_id: user.id
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          content: newMessageText,
          sender: 'real',
          sender_id: user.id,
        }
      ])
      .select()
      .single();

    if (error) {
      toast({
        title: "Gửi tin nhắn thất bại!",
        description: "Có lỗi xảy ra khi gửi tin: " + error.message,
      });
      return;
    }

    // Tin nhắn sẽ hiển thị lập tức khi nhận được event realtime (do logic bên trên).
    // Tuy nhiên, để cảm giác chat tức thời, có thể append luôn vào UI, tránh chậm trễ hiển thị
    setMessages(prev => [
      ...prev,
      {
        id: data.id,
        text: newMessageText,
        sender: 'user',
        timestamp: new Date(data.created_at),
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Enhanced debug logging
  useEffect(() => {
    console.log("🖥️ [CHAT UI] State update:", {
      matchmaking: {
        isInQueue: matchmaking?.isInQueue,
        isMatched: matchmaking?.isMatched,
        partnerId: matchmaking?.partnerId,
        conversationId: matchmaking?.conversationId
      },
      ui: {
        hasStranger: !!stranger,
        messagesCount: messages.length,
        hasNotified
      },
      timestamp: new Date().toISOString()
    });
  }, [
    matchmaking?.isInQueue, 
    matchmaking?.isMatched, 
    matchmaking?.partnerId, 
    matchmaking?.conversationId, 
    stranger, 
    messages.length,
    hasNotified
  ]);

  const startSearching = async () => {
    const realUserId = user?.id || anonId;
    console.log("🎯 [CHAT UI] Starting search - userId:", realUserId);
    
    // Clear previous state
    setMessages([]);
    setConversationHistory([]);
    setIsAIMode(false);
    setStranger(null);
    setHasNotified(false);
    
    if (matchmaking?.startQueue && realUserId) {
      try {
        setIsStartingQueue(true);
        console.log("🎯 [CHAT UI] Calling matchmaking.startQueue");
        await matchmaking.startQueue(realUserId);
      } catch (err) {
        console.error("❌ [CHAT UI] Error starting queue:", err);
      } finally {
        setIsStartingQueue(false);
      }
    }
  };

  const disconnect = async () => {
    console.log("🔌 [CHAT UI] Disconnecting");
    setStranger(null);
    setMessages([]);
    setConversationHistory([]);
    setIsTyping(false);
    setHasNotified(false);
    if (matchmaking?.reset) await matchmaking.reset();
  };

  // FORCE UI update: Nếu state đã đủ điều kiện, luôn ép tạo khung chat mới!
  useEffect(() => {
    const isCurrentlyMatched = matchmaking?.isMatched && 
                              !!matchmaking?.partnerId && 
                              !!matchmaking?.conversationId;

    // Log, log, log
    console.log("🎯 [CHAT UI] Match effect triggered:", {
      isCurrentlyMatched,
      group: {
        isMatched: matchmaking?.isMatched,
        partnerId: matchmaking?.partnerId,
        conversationId: matchmaking?.conversationId
      },
      ui: {
        hasStranger: !!stranger,
        messagesCount: messages.length
      }
    });

    // Mỗi lần detect match, ép set stranger & welcome message lại (dù trước đó đã có để tránh bị miss render do state không đổi giá trị pointer)
    if (isCurrentlyMatched) {
      setStranger({
        name: "Người lạ",
        age: "?",
        avatar: null,
      });

      if (messages.length === 0) {
        setMessages([
          {
            id: Date.now().toString(),
            text: `Bạn đã được kết nối với 1 người lạ. Hãy bắt đầu trò chuyện!`,
            sender: "stranger",
            timestamp: new Date(),
          },
        ]);
      }
    } else if (!matchmaking?.isInQueue) {
      if (stranger || messages.length > 0) {
        setStranger(null);
        setMessages([]);
      }
    }
  }, [
    matchmaking?.isMatched, 
    matchmaking?.partnerId, 
    matchmaking?.conversationId, 
    matchmaking?.isInQueue
    // không phụ thuộc stranger/messages để tránh infinite loop setState
  ]);

  // Sound notification when matched
  useEffect(() => {
    if (matchmaking?.isMatched && matchmaking?.partnerId && matchmaking?.conversationId && !hasNotified) {
      console.log("🔔 [CHAT UI] Playing match notification");
      toast({
        title: "🔔 Đã kết nối với người lạ!",
        description: "Bạn đã được ghép nối thành công. Hãy bắt đầu trò chuyện!",
      });
      
      if (!audioRef.current) {
        audioRef.current = new window.Audio(PING_SOUND_URL);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setHasNotified(true);
    }
    
    if (!matchmaking?.isMatched && hasNotified) {
      setHasNotified(false);
    }
  }, [matchmaking?.isMatched, matchmaking?.partnerId, matchmaking?.conversationId, hasNotified, toast]);

  const handleApplyStrangerSettings = (settings: StrangerSettings) => {
    setStrangerSettings(settings);
    toast({
      title: "Cài đặt đã lưu",
      description: `Sẽ tìm kiếm ${settings.gender === 'all' ? 'tất cả giới tính' : settings.gender === 'male' ? 'nam' : settings.gender === 'female' ? 'nữ' : 'khác'}, ${settings.ageGroup === 'all' ? 'mọi độ tuổi' : settings.ageGroup === 'gen-z' ? 'Gen Z' : settings.ageGroup === 'millennial' ? '9x' : 'trên 35'}`,
    });
  };

  const disableStartBtn = !(user?.id || anonId) || isStartingQueue;
  const matchmakingStatus = matchmaking?.isInQueue ? 'searching' : matchmaking?.isMatched ? 'matched' : 'idle';

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
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

      {/* Enhanced Debug info */}
      {isAdminMode && (
        <div className="bg-yellow-100 p-2 text-xs">
          <strong>Debug:</strong> Status: {matchmakingStatus} | 
          Matched: {String(matchmaking?.isMatched)} | 
          Queue: {String(matchmaking?.isInQueue)} | 
          Partner: {matchmaking?.partnerId || 'none'} | 
          Conv: {matchmaking?.conversationId || 'none'} |
          UI-Stranger: {stranger ? 'yes' : 'no'} |
          UI-Messages: {messages.length}
        </div>
      )}

      {/* Connection Status */}
      {matchmakingStatus !== "matched" && matchmakingStatus !== "searching" && (
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
            <div className="flex justify-center mb-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={disconnect}
              className="text-sm"
            >
              Dừng tìm kiếm
            </Button>
          </Card>
        </div>
      )}

      {/* Chat UI when matched */}
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
                disabled={isTyping || !conversationId}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
                size="sm"
                disabled={isTyping || !inputValue.trim() || !conversationId}
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
