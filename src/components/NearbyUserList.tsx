
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Heart, MessageCircle, Star, Crown } from "lucide-react";

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

interface NearbyUserListProps {
  users: NearbyUser[];
  userLocation: { lat: number; lng: number } | null;
  hasExpandedRange: boolean;
  upgradeStatus: string | undefined;
  onViewProfile: (u: NearbyUser) => void;
  onLikeUser: (userId: string, e?: React.MouseEvent) => void;
  onMessageUser: (userId: string, e?: React.MouseEvent) => void;
}

const NearbyUserList: React.FC<NearbyUserListProps> = ({
  users,
  userLocation,
  hasExpandedRange,
  upgradeStatus,
  onViewProfile,
  onLikeUser,
  onMessageUser
}) => (
  <div>
    {/* Header */}
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h1 className="text-xl font-bold text-gray-800">Quanh đây</h1>
        {userLocation && (
          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            GPS
          </div>
        )}
        {hasExpandedRange && upgradeStatus === "approved" && (
          <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Mở rộng
          </div>
        )}
      </div>
      <p className="text-gray-600 text-sm">
        {users.length} người trong phạm vi {hasExpandedRange && upgradeStatus === "approved" ? "20km" : "5km"}
      </p>
    </div>
    {/* Users List */}
    <ScrollArea className="flex-1">
      <div className="space-y-3 pb-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="p-4 hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => onViewProfile(user)}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                {user.isOnline && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">
                    {user.name}, {user.age}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{user.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.distance}km</span>
                  <span>•</span>
                  <span>{user.lastSeen}</span>
                </div>
                <div className="flex gap-1">
                  {user.interests.slice(0, 2).map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                  {user.interests.length > 2 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs">
                      +{user.interests.length - 2}
                    </span>
                  )}
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={`w-8 h-8 p-0 rounded-full transition-all duration-200 ${
                    user.isLiked
                      ? "border-pink-300 bg-pink-50 hover:bg-pink-100"
                      : "hover:border-pink-300 hover:bg-pink-50"
                  }`}
                  onClick={(e) => onLikeUser(user.id, e)}
                >
                  <Heart className={`w-4 h-4 text-pink-500 ${user.isLiked ? "fill-current" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8 p-0 rounded-full hover:border-blue-300 hover:bg-blue-50"
                  onClick={(e) => onMessageUser(user.id, e)}
                >
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  </div>
);

export default NearbyUserList;
