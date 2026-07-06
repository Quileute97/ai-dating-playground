import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Settings, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import StrangerSettingsModal from './StrangerSettingsModal';
import { useStrangerMatchmaking } from '@/hooks/useStrangerMatchmaking';
import { useStrangerChat } from '@/hooks/useStrangerChat';

interface ChatInterfaceProps {
  user?: any;
  isAdminMode?: boolean;
  anonId?: string;
}

interface StrangerSettings {
  gender: string;
  ageGroup: string;
}

const PING_SOUND_URL = "/ping.mp3";

const ChatInterface = ({ user, isAdminMode = false, anonId }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showStrangerSettings, setShowStrangerSettings] = useState(false);
  const [strangerSettings, setStrangerSettings] = useState<StrangerSettings>({
    gender: 'all',
    ageGroup: 'all'
  });
  const [hasNotified, setHasNotified] = useState(false);
  const [isStartingQueue, setIsStartingQueue] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentUserId = user?.id || anonId;
  const matchmaking = useStrangerMatchmaking();
  const chat = useStrangerChat(currentUserId);

  // Sync chat state với matchmaking state
  useEffect(() => {
    if (matchmaking.isMatched && matchmaking.conversationId && matchmaking.partnerId) {
      chat.setMatch(matchmaking.conversationId, matchmaking.partnerId);
    } else if (!matchmaking.isMatched) {
      chat.resetMatch();
    }
  }, [matchmaking.isMatched, matchmaking.conversationId, matchmaking.partnerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  // Sound notification when matched
  useEffect(() => {
    if (matchmaking.isMatched && !hasNotified) {
      console.log("🔔 Playing match notification");
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
    
    if (!matchmaking.isMatched && hasNotified) {
      setHasNotified(false);
    }
  }, [matchmaking.isMatched, hasNotified, toast]);

  const startSearching = async () => {
    console.log("🎯 Starting search - userId:", currentUserId);
    
    if (!currentUserId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để sử dụng tính năng này",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsStartingQueue(true);
      await matchmaking.startQueue(currentUserId);
    } catch (err) {
      console.error("❌ Error starting queue:", err);
      toast({
        title: "Lỗi",
        description: "Không thể bắt đầu tìm kiếm. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsStartingQueue(false);
    }
  };

  const disconnect = async () => {
    console.log("🔌 Disconnecting");
    await matchmaking.reset();
    chat.resetMatch();
    setHasNotified(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    await chat.sendMessage(inputValue);
    setInputValue('');
  };

  const handleApplyStrangerSettings = (settings: StrangerSettings) => {
    setStrangerSettings(settings);
    toast({
      title: "Cài đặt đã lưu",
      description: `Sẽ tìm kiếm ${settings.gender === 'all' ? 'tất cả giới tính' : settings.gender}`,
    });
  };

  const disableStartBtn = !currentUserId || isStartingQueue;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <audio ref={audioRef} src={PING_SOUND_URL} preload="auto" style={{display:'none'}} />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 leading-tight">Hyliya - Hẹn hò AI & kết nối thông minh cho người Việt</h1>
              <p className="text-sm text-gray-500">Chat an toàn, ghép đôi thông minh và tìm bạn quanh đây</p>
            </div>
          </div>
          {user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStrangerSettings(true)}
              aria-label="Cài đặt chat"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Debug info */}
      {isAdminMode && (
        <div className="bg-yellow-100 p-2 text-xs">
          <strong>Debug:</strong> 
          InQueue: {String(matchmaking.isInQueue)} | 
          Matched: {String(matchmaking.isMatched)} | 
          Partner: {matchmaking.partnerId || 'none'} | 
          Conv: {matchmaking.conversationId || 'none'} |
          Messages: {chat.messages.length} |
          UserId: {currentUserId || 'none'}
        </div>
      )}

      {/* Connection Status - Idle */}
      {!matchmaking.isInQueue && !matchmaking.isMatched && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 text-center bg-white/70 backdrop-blur-sm border-purple-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sẵn sàng kết nối?</h2>
            <p className="text-gray-600 mb-6">Tìm kiếm những người bạn mới thú vị để trò chuyện cùng!</p>
            <Button 
              onClick={startSearching}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={disableStartBtn}
            >
              {isStartingQueue ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang bắt đầu...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bắt đầu chat
                </>
              )}
            </Button>
            {!currentUserId && (
              <p className="text-xs text-gray-500 mt-2">Vui lòng đăng nhập để bắt đầu chat</p>
            )}
          </Card>
        </div>
      )}

      {/* Searching Status */}
      {matchmaking.isInQueue && !matchmaking.isMatched && (
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 text-center bg-white/70 backdrop-blur-sm border-purple-200">
            <div className="animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Đang tìm kiếm người lạ...</h2>
            <p className="text-gray-600 mb-4">Chờ một chút để tìm người phù hợp với bạn.</p>
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
      {matchmaking.isMatched && chat.isMatched && (
        <>
          {/* Stranger Info */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-purple-200 flex items-center justify-center text-gray-500">
                ?
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">Người lạ</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Đang online</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={disconnect}>
                Ngắt kết nối
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Bạn đã được kết nối với một người lạ!</p>
                <p className="text-sm">Hãy bắt đầu cuộc trò chuyện nhé 👋</p>
              </div>
            )}
            
            {chat.messages.map((message) => {
              const isFromMe = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isFromMe
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-purple-100 shadow-md'
                  }`}>
                    {/* Display image if media_url exists and is image */}
                    {message.media_url && message.media_type?.startsWith('image') && (
                      <div className="mb-2">
                        <img 
                          src={message.media_url} 
                          alt="Hình ảnh được chia sẻ trong cuộc trò chuyện" 
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.media_url, '_blank')}
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    
                    {/* Display video if media_url exists and is video */}
                    {message.media_url && message.media_type?.startsWith('video') && (
                      <div className="mb-2">
                        <video 
                          src={message.media_url} 
                          controls 
                          className="max-w-full h-auto rounded-lg"
                          style={{ maxHeight: '200px' }}
                        />
                      </div>
                    )}
                    
                    {/* Handle legacy image messages in content */}
                    {!message.media_url && message.content?.includes('https://') && message.content?.includes('[🖼️ Ảnh]') && (
                      <div className="mb-2">
                        <img 
                          src={message.content.split('] ')[1]} 
                          alt="Hình ảnh được chia sẻ trong cuộc trò chuyện" 
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.content.split('] ')[1], '_blank')}
                          style={{ maxHeight: '200px' }}
                        />
                        <p className="text-sm break-words mt-2">{message.content.split('] ')[0]}]</p>
                      </div>
                    )}
                    
                    {/* Display regular text content */}
                    {message.content && (!message.content.includes('[🖼️ Ảnh]') || message.media_url) && (
                      <p className="text-sm break-words">{message.content}</p>
                    )}
                    
                    <p className={`text-xs mt-1 ${
                      isFromMe ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-purple-100 p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border-purple-200 focus:border-purple-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={!chat.conversationId}
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="sm"
                disabled={!inputValue.trim() || !chat.conversationId}
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
