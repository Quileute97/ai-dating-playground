
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Briefcase, GraduationCap, Ruler, Clock, UserPlus, MessageCircle, Album, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSendFriendRequest, useFriendList, useSentFriendRequests } from "@/hooks/useFriends";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const { toast } = useToast();
  
  // Friend hooks
  const sendFriendRequest = useSendFriendRequest();
  const { data: friends } = useFriendList(currentUser?.id);
  const { data: sentRequests } = useSentFriendRequests(currentUser?.id);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [userId]);

  const handleSendFriendRequest = async () => {
    if (!currentUser || !userId) return;
    
    try {
      await sendFriendRequest.mutateAsync({
        user_id: currentUser.id,
        friend_id: userId,
      });
      toast({
        title: "Đã gửi lời mời kết bạn",
        description: `Lời mời kết bạn đã được gửi đến ${profile?.name}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat or open chat interface
    toast({
      title: "Tính năng đang phát triển",
      description: "Tính năng nhắn tin sẽ sớm được cập nhật",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 animate-pulse text-lg">Đang tải hồ sơ...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500 text-lg">Không tìm thấy hồ sơ người dùng.</div>
      </div>
    );
  }

  const getDatingStatus = () => {
    if (profile.is_dating_active) {
      return <Badge className="bg-green-500">Đang hoạt động</Badge>;
    }
    return <Badge variant="secondary">Tạm dừng</Badge>;
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      default: return 'Khác';
    }
  };

  // Check if already friends or request sent
  const isAlreadyFriend = friends?.some(f => 
    (f.user_id === currentUser?.id && f.friend_id === userId) ||
    (f.friend_id === currentUser?.id && f.user_id === userId)
  );
  
  const isRequestSent = sentRequests?.some(r => r.friend_id === userId);
  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="min-h-screen flex justify-center items-start bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 py-10">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center">
            <img
              src={profile.avatar || '/placeholder.svg'}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 mb-4 bg-white"
            />
            <CardTitle className="text-center text-xl">{profile.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600">{profile.age} tuổi</span>
              <span>•</span>
              <span className="text-gray-600">{getGenderDisplay(profile.gender)}</span>
              {profile.height && (
                <>
                  <span>•</span>
                  <span className="text-gray-600 flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {profile.height}cm
                  </span>
                </>
              )}
            </div>
            <div className="mt-2">
              {getDatingStatus()}
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
              <div className="flex gap-2 mt-4 w-full">
                <Button
                  onClick={handleSendFriendRequest}
                  disabled={isAlreadyFriend || isRequestSent || sendFriendRequest.isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  {isAlreadyFriend ? "Đã kết bạn" : isRequestSent ? "Đã gửi lời mời" : "Kết bạn"}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Nhắn tin
                </Button>
                {profile.album && Array.isArray(profile.album) && profile.album.length > 0 && (
                  <Button
                    onClick={() => setShowAlbumModal(true)}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Album className="w-4 h-4 mr-1" />
                    Album
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <div>
              <span className="font-semibold">Giới thiệu: </span>
              <span className="text-gray-700">{profile.bio}</span>
            </div>
          )}

          {profile.job && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">Nghề nghiệp:</span>
              <span className="text-gray-700">{profile.job}</span>
            </div>
          )}

          {profile.education && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-gray-500" />
              <span className="font-semibold">Học vấn:</span>
              <span className="text-gray-700">{profile.education}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-semibold">Địa điểm:</span>
            <span className="text-gray-700">
              {profile.location_name || (
                profile.lat && profile.lng
                  ? `${parseFloat(profile.lat).toFixed(4)}, ${parseFloat(profile.lng).toFixed(4)}`
                  : "Chưa cập nhật"
              )}
            </span>
          </div>

          {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div>
              <span className="font-semibold">Sở thích:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.interests.map((interest: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}

          {profile.album && Array.isArray(profile.album) && profile.album.length > 0 && (
            <div>
              <span className="font-semibold">Album ảnh:</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {profile.album.slice(0, 6).map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Ảnh ${idx + 1}`}
                    className="rounded-lg object-cover w-full h-20 border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowAlbumModal(true)}
                  />
                ))}
              </div>
            </div>
          )}

          {profile.last_active && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Hoạt động lần cuối: {new Date(profile.last_active).toLocaleDateString('vi-VN')}</span>
            </div>
          )}

          <div className="text-xs text-gray-400 mt-8 text-right border-t pt-2">
            ID: {profile.id}
          </div>
        </CardContent>
      </Card>

      {/* Album Modal */}
      <Dialog open={showAlbumModal} onOpenChange={setShowAlbumModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Album ảnh của {profile.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAlbumModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {profile.album?.map((img: string, idx: number) => (
              <div key={idx} className="aspect-square">
                <img
                  src={img}
                  alt={`Ảnh ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfilePage;
