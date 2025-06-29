
import React, { useState } from 'react';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserMatches } from '@/hooks/useUserMatches';
import { useChatIntegration } from '@/hooks/useChatIntegration';
import MatchProfile from './MatchProfile';

interface MatchesManagerProps {
  userId: string;
  onBack: () => void;
}

export default function MatchesManager({ userId, onBack }: MatchesManagerProps) {
  const { matches, loading } = useUserMatches(userId);
  const { startChatWith } = useChatIntegration();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const handleChatClick = (match: any) => {
    startChatWith({
      id: match.id,
      name: match.name,
      avatar: match.avatar
    });
  };

  const handleViewProfile = (match: any) => {
    setSelectedMatch(match);
  };

  if (selectedMatch) {
    return (
      <MatchProfile
        profile={selectedMatch}
        onBack={() => setSelectedMatch(null)}
        onChat={() => handleChatClick(selectedMatch)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Đang tải danh sách matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm border-b border-pink-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-pink-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Matches của bạn</h1>
          <p className="text-sm text-gray-600">{matches.length} matches</p>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="p-4">
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có matches</h3>
            <p className="text-gray-500">Hãy tiếp tục swipe để tìm người phù hợp!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {matches.map((match) => (
              <Card 
                key={match.id} 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleViewProfile(match)}
              >
                <div className="relative">
                  <img
                    src={match.avatar || '/placeholder.svg'}
                    alt={match.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Match Badge */}
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    MATCH
                  </div>

                  {/* Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="font-semibold text-lg">{match.name}</h3>
                    {match.age && <p className="text-sm opacity-90">{match.age} tuổi</p>}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-white">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatClick(match);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
