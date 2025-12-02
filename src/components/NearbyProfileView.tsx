
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, MessageCircle, MapPin, Briefcase, GraduationCap, Ruler } from 'lucide-react';
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  distance: number;
  avatar: string;
  gender?: string;
  isOnline: boolean;
  lastSeen: string;
  interests: string[];
  rating: number;
  isLiked?: boolean;
  bio?: string;
  height?: number;
  job?: string;
  education?: string;
  location_name?: string;
}

interface NearbyProfileViewProps {
  user: NearbyUser;
  onClose: () => void;
  onLike: (userId: string) => void;
  onMessage: (userId: string) => void;
}

const NearbyProfileView = ({ user, onClose, onLike, onMessage }: NearbyProfileViewProps) => {
  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 bg-white/90 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-gray-800">Hồ sơ</h1>
        </div>

        {/* Profile Card */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <img
                src={getDefaultAvatar(user.gender, user.avatar)}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 mx-auto"
              />
              {user.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <CardTitle className="text-xl">{user.name}, {user.age}</CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{user.distance}km • {user.lastSeen}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {user.bio && (
              <div>
                <span className="font-semibold">Giới thiệu:</span>
                <p className="text-gray-700 mt-1">{user.bio}</p>
              </div>
            )}

            {user.height && (
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Chiều cao:</span>
                <span className="text-gray-700">{user.height}cm</span>
              </div>
            )}

            {user.job && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Nghề nghiệp:</span>
                <span className="text-gray-700">{user.job}</span>
              </div>
            )}

            {user.education && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Học vấn:</span>
                <span className="text-gray-700">{user.education}</span>
              </div>
            )}

            {user.location_name && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">Địa điểm:</span>
                <span className="text-gray-700">{user.location_name}</span>
              </div>
            )}

            {user.interests && user.interests.length > 0 && (
              <div>
                <span className="font-semibold">Sở thích:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {user.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className={`flex-1 transition-all duration-200 ${
                  user.isLiked
                    ? "border-pink-300 bg-pink-50 hover:bg-pink-100"
                    : "hover:border-pink-300 hover:bg-pink-50"
                }`}
                onClick={() => onLike(user.id)}
              >
                <Heart className={`w-4 h-4 mr-2 text-pink-500 ${user.isLiked ? "fill-current" : ""}`} />
                {user.isLiked ? "Đã thích" : "Thích"}
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => onMessage(user.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Nhắn tin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NearbyProfileView;
