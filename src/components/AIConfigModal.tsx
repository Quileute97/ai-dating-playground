
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Key, Sparkles } from 'lucide-react';
import { aiService } from '@/services/aiService';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfigModal = ({ isOpen, onClose }: AIConfigModalProps) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState('friendly');
  const [isConnecting, setIsConnecting] = useState(false);

  const personalities = [
    { id: 'friendly', name: 'Thân thiện', emoji: '😊', desc: 'Vui vẻ, dễ gần và tích cực' },
    { id: 'romantic', name: 'Lãng mạn', emoji: '💕', desc: 'Ngọt ngào, ấm áp và quan tâm' },
    { id: 'cool', name: 'Cool ngầu', emoji: '😎', desc: 'Ít nói nhưng có cá tính' },
    { id: 'funny', name: 'Hài hước', emoji: '🤣', desc: 'Vui tính, thích đùa và sáng tạo' },
    { id: 'shy', name: 'Nhút nhát', emoji: '🙈', desc: 'Dễ thương, e dè và ngọt ngào' }
  ];

  const handleConnect = async () => {
    // Note: API key is now stored in Supabase secrets by admin
    // This modal is for selecting personality only
    setIsConnecting(true);
    try {
      // Save personality preference to localStorage
      localStorage.setItem('aiPersonality', selectedPersonality);
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsConnecting(false);
      onClose();
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to save AI config:', error);
    }
  };

  const handleSkip = () => {
    // Use mock AI responses
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-500" />
            Cấu hình AI Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
                <Key className="w-5 h-5" />
                🔒 Bảo mật AI
              </CardTitle>
              <CardDescription className="text-blue-600">
                OpenAI API key được quản lý an toàn bởi admin trong Supabase Secrets. 
                Bạn chỉ cần chọn tính cách AI bên dưới.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Personality Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5" />
                Chọn tính cách AI
              </CardTitle>
              <CardDescription>
                AI sẽ trò chuyện theo phong cách bạn chọn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {personalities.map((personality) => (
                  <div
                    key={personality.id}
                    onClick={() => setSelectedPersonality(personality.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPersonality === personality.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{personality.emoji}</span>
                      <div>
                        <h4 className="font-medium">{personality.name}</h4>
                        <p className="text-sm text-gray-600">{personality.desc}</p>
                      </div>
                      {selectedPersonality === personality.id && (
                        <Badge className="ml-auto bg-purple-500">Đã chọn</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Bỏ qua
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang lưu...
                </div>
              ) : (
                'Lưu cài đặt'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigModal;
