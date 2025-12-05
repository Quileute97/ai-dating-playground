
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
    if (!apiKey.trim()) return;
    
    setIsConnecting(true);
    try {
      aiService.setApiKey(apiKey);
      // Test the connection with a simple request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnecting(false);
      onClose();
    } catch (error) {
      setIsConnecting(false);
      console.error('Failed to connect to AI service:', error);
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
          {/* API Key Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="w-5 h-5" />
                OpenAI API Key (Tùy chọn)
              </CardTitle>
              <CardDescription>
                Nhập API key để sử dụng AI thật. Nếu không có, hệ thống sẽ dùng AI mô phỏng.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apikey">API Key</Label>
                <Input
                  id="apikey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">
                Lấy API key tại{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
            </CardContent>
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
              Dùng AI mô phỏng
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!apiKey.trim() || isConnecting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang kết nối...
                </div>
              ) : (
                'Kết nối AI'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfigModal;
