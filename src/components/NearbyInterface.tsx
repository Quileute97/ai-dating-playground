
import React, { useState, useEffect } from "react";
import { MapPin, Heart, MessageCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useChatIntegration } from '@/hooks/useChatIntegration';
import { useGeolocation } from "@/hooks/useGeolocation";

interface NearbyInterfaceProps {
  user: any;
}

const NearbyInterface = ({ user }: NearbyInterfaceProps) => {
  const [distance, setDistance] = useState(5); // Initial distance in kilometers
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get user location
  const { position: userLocation } = useGeolocation();
  
  // Use the hook with correct parameters
  const { profiles, loading } = useNearbyProfiles(user?.id, userLocation, distance);
  const { startChatWith } = useChatIntegration();

  const handleProfileClick = (profile: any) => {
    navigate(`/profile/${profile.id}`);
  };

  const handleChatClick = (profile: any) => {
    // Use unified chat system instead of separate modal
    startChatWith({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar
    });
  };

  const handleLikeClick = (profile: any) => {
    toast({
      title: "❤️ Đã thích",
      description: `Bạn đã thích ${profile.name}!`,
    });
    // TODO: Implement like functionality
  };

  const handleDistanceChange = (value: number[]) => {
    setDistance(value[0]);
  };

  return (
    <div className="container relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          <h1 className="text-lg font-semibold">Quanh đây</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
          {showMap ? "Ẩn bản đồ" : "Xem bản đồ"}
        </Button>
      </div>

      {/* Distance Filter */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="distance">Khoảng cách: {distance} km</Label>
        </div>
        <Slider
          id="distance"
          defaultValue={[distance]}
          max={50}
          step={1}
          onValueChange={handleDistanceChange}
          className="mt-2"
        />
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : profiles && profiles.length > 0 ? (
          <ScrollArea className="h-full w-full p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex flex-col h-full">
                    <img
                      src={profile.avatar || "/placeholder.svg"}
                      alt={profile.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h2 className="text-lg font-semibold">{profile.name}</h2>
                    <p className="text-sm text-gray-500">{profile.bio || "Không có bio"}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary">
                          <Map className="w-3 h-3 mr-1" />
                          {profile.distance} km
                        </Badge>
                        {profile.last_active && new Date(profile.last_active) > new Date(Date.now() - 5 * 60 * 1000) && (
                          <Badge variant="outline">
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLikeClick(profile)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleChatClick(profile)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 text-center text-gray-500">
            Không tìm thấy ai ở gần bạn. Hãy thử tăng khoảng cách tìm kiếm.
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyInterface;
