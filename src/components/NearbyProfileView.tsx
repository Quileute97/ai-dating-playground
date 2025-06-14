
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, ArrowLeft, Heart, MessageCircle, Star } from "lucide-react";

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  distance: number;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  interests: string[];
  rating: number;
  isLiked?: boolean;
}

interface NearbyProfileViewProps {
  user: NearbyUser;
  onClose: () => void;
  onLike: (userId: string) => void;
  onMessage: (userId: string) => void;
}

const NearbyProfileView: React.FC<NearbyProfileViewProps> = ({
  user,
  onClose,
  onLike,
  onMessage,
}) => (
  <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="max-w-md mx-auto h-full flex flex-col">
      <div className="flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm">
        <Button variant="outline" size="sm" onClick={onClose} className="rounded-full p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold">Hồ sơ cá nhân</h1>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <Card className="overflow-hidden mb-4">
            <div className="relative h-64">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {user.isOnline && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <div className="w-2 h-2 bg-white rounded-full"></div>Online
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold">
                  {user.name}, {user.age}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.distance}km từ bạn</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-medium">{user.rating}</span>
                <span className="text-gray-500 text-sm">{`(${Math.floor(Math.random() * 50) + 10} đánh giá)`}</span>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Hoạt động: {user.lastSeen}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Sở thích</h3>
                <div className="flex flex-wrap gap-2">
                  {user.interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Giới thiệu</h3>
                  <p className="text-gray-600 text-sm">
                    Xin chào! Tôi là {user.name}, rất vui được gặp bạn. Tôi thích{" "}
                    {user.interests.join(", ").toLowerCase()} và luôn sẵn sàng khám phá những điều mới mẻ.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Tìm kiếm</h3>
                  <p className="text-gray-600 text-sm">
                    Tìm kiếm những mối quan hệ chân thành và có ý nghĩa. Hy vọng có thể gặp được người phù hợp để cùng chia sẻ những trải nghiệm thú vị.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  className={`flex-1 transition-all duration-200 ${
                    user.isLiked
                      ? "bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 shadow-lg"
                      : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                  }`}
                  onClick={() => onLike(user.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${user.isLiked ? "fill-current" : ""}`} />
                  {user.isLiked ? "Đã thích" : "Thích"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => onMessage(user.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
);

export default NearbyProfileView;
