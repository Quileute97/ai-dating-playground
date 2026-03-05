import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Briefcase, GraduationCap, Ruler, Clock, UserPlus, MessageCircle, Album, X, ArrowLeft, Home, Share2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFakeUserInteractions } from "@/hooks/useFakeUserInteractions";
import ProfileChatWindow from "@/components/ProfileChatWindow";
import { useStars } from "@/hooks/useStars";
import DonateStarModal from "@/components/DonateStarModal";

const FakeUserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const { toast } = useToast();
  const fakeUserInteractions = useFakeUserInteractions(currentUser?.id);
  const { starBalance, donateStars } = useStars(currentUser?.id);

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
      .from("fake_users")
      .select("*")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        console.log('Fake user profile data:', data);
        setProfile(data);
        setLoading(false);
      });
  }, [userId]);

  const handleBackClick = () => {
    // Try to go back in history first, if no history then go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentUser || !userId) return;
    
    try {
      await fakeUserInteractions.sendFriendRequestToFakeUser(userId);
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

  const handleSendMessage = async () => {
    if (!currentUser || !userId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để nhắn tin",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await fakeUserInteractions.createConversationWithFakeUser(userId);
      setShowChatWindow(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo cuộc trò chuyện. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-600 font-medium">Đang tải hồ sơ...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-gray-600 text-lg mb-4">Không tìm thấy hồ sơ người dùng.</div>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const getDatingStatus = () => {
    if (profile.is_dating_active) {
      return <Badge className="bg-green-500 hover:bg-green-600">Đang hoạt động</Badge>;
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

  return (
    <>
      <SEOHead 
        title={profile ? `${profile.name} - Hồ sơ người dùng | Hyliya` : "Hồ sơ người dùng | Hyliya"}
        description={profile?.bio || `Xem hồ sơ của ${profile?.name || 'người dùng'} trên Hyliya - Ứng dụng hẹn hò và kết nối thông minh.`}
        keywords={`${profile?.name || 'người dùng'}, hồ sơ, hẹn hò, kết nối, Hyliya`}
        image={profile?.avatar || "https://hyliya.com/og-image.jpg"}
        url={`https://hyliya.com/u/${userId}`}
        type="profile"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100">
        {/* Header Navigation */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <Button 
              onClick={handleBackClick}
              variant="ghost" 
              size="sm"
              className="hover:bg-purple-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
            
            <h1 className="font-semibold text-gray-800">Hồ sơ cá nhân</h1>
            
            <div className="flex items-center gap-1">
              <Button
                onClick={async () => {
                  const url = `${window.location.origin}/u/${userId}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast({ title: "Đã sao chép link", description: "Link hồ sơ đã được sao chép." });
                  } catch {
                    const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
                    toast({ title: "Đã sao chép link", description: "Link hồ sơ đã được sao chép." });
                  }
                  if (navigator.share) { try { await navigator.share({ title: `${profile?.name} - Hyliya`, url }); } catch {} }
                }}
                variant="ghost"
                size="sm"
                className="hover:bg-purple-100 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => navigate('/')}
                variant="ghost" 
                size="sm"
                className="hover:bg-purple-100 transition-colors"
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex justify-center items-start py-6 px-4">
          <Card className="max-w-md w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={profile.avatar || '/placeholder.svg'}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg bg-white"
                  />
                  <div className="absolute -bottom-2 -right-2">
                    {getDatingStatus()}
                  </div>
                </div>
                
                <CardTitle className="text-center text-2xl font-bold text-gray-800 mb-2">
                  {profile.name}
                </CardTitle>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                  <span className="bg-purple-100 px-3 py-1 rounded-full font-medium">
                    {profile.age} tuổi
                  </span>
                  <span className="bg-pink-100 px-3 py-1 rounded-full font-medium">
                    {getGenderDisplay(profile.gender)}
                  </span>
                  {profile.height && (
                    <span className="bg-blue-100 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      {profile.height}cm
                    </span>
                  )}
                </div>

                {/* Action Buttons for fake users - Limited functionality */}
                <div className="flex gap-3 mt-4 w-full">
                  <Button
                    onClick={handleSendFriendRequest}
                    disabled={!currentUser || fakeUserInteractions.isProcessing}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {currentUser ? "Kết bạn" : "Đăng nhập để kết bạn"}
                  </Button>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentUser || fakeUserInteractions.isProcessing}
                    variant="outline" 
                    className="flex-1"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {currentUser ? "Nhắn tin" : "Đăng nhập để nhắn tin"}
                  </Button>

                  <Button
                    onClick={() => setShowDonate(true)}
                    disabled={!currentUser}
                    variant="outline"
                    className="flex-shrink-0 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                    size="sm"
                  >
                    <Star className="w-4 h-4 fill-yellow-400" />
                  </Button>
                  
                  {profile.album && Array.isArray(profile.album) && profile.album.length > 0 && (
                    <Button
                      onClick={() => setShowAlbumModal(true)}
                      variant="outline"
                      className="flex-shrink-0 border-purple-200 hover:bg-purple-50 shadow-md transform hover:scale-105 transition-all duration-200"
                      size="sm"
                    >
                      <Album className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {profile.bio && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="font-semibold text-gray-800 block mb-2">💭 Giới thiệu:</span>
                  <span className="text-gray-700 leading-relaxed">{profile.bio}</span>
                </div>
              )}

              {profile.job && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 block">Nghề nghiệp</span>
                    <span className="text-gray-700">{profile.job}</span>
                  </div>
                </div>
              )}

              {profile.education && (
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-800 block">Học vấn</span>
                    <span className="text-gray-700">{profile.education}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <span className="font-semibold text-gray-800 block">Địa điểm</span>
                  <span className="text-gray-700">
                    {profile.location_name || (
                      profile.lat && profile.lng
                        ? `${parseFloat(profile.lat).toFixed(4)}, ${parseFloat(profile.lng).toFixed(4)}`
                        : "Chưa cập nhật"
                    )}
                  </span>
                </div>
              </div>

              {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <span className="font-semibold text-gray-800 block mb-3">🎯 Sở thích:</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="bg-white border border-yellow-200 text-yellow-800 hover:bg-yellow-100 transition-colors"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.album && Array.isArray(profile.album) && profile.album.length > 0 && (
                <div className="p-3 bg-pink-50 rounded-lg">
                  <span className="font-semibold text-gray-800 block mb-3">📸 Album ảnh:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {profile.album.slice(0, 6).map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="rounded-lg object-cover w-full h-20 border-2 border-white shadow-md cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-200"
                        onClick={() => setShowAlbumModal(true)}
                      />
                    ))}
                  </div>
                  {profile.album.length > 6 && (
                    <Button
                      onClick={() => setShowAlbumModal(true)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-pink-200 hover:bg-pink-100"
                    >
                      Xem tất cả ({profile.album.length} ảnh)
                    </Button>
                  )}
                </div>
              )}

              {profile.last_active && (
                <div className="flex items-center gap-2 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Hoạt động lần cuối: {new Date(profile.last_active).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center border-t pt-4">
                ID: {profile.id}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Album Modal */}
        <Dialog open={showAlbumModal} onOpenChange={setShowAlbumModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-xl">
                📸 Album ảnh của {profile.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAlbumModal(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 max-h-[70vh] overflow-y-auto">
              {profile.album?.map((img: string, idx: number) => (
                <div key={idx} className="aspect-square group relative">
                  <img
                    src={img}
                    alt={`Ảnh ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-200" />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Chat Window */}
      {showChatWindow && currentUser && profile && (
        <ProfileChatWindow
          targetUserId={userId!}
          targetUserName={profile.name}
          targetUserAvatar={profile.avatar || '/placeholder.svg'}
          currentUserId={currentUser.id}
          onClose={() => setShowChatWindow(false)}
        />
      )}

      {showDonate && profile && currentUser && (
        <DonateStarModal
          isOpen={showDonate}
          onClose={() => setShowDonate(false)}
          receiverName={profile.name || 'Người dùng'}
          receiverId={userId!}
          currentBalance={starBalance.balance}
          onDonate={donateStars}
        />
      )}
    </>
  );
};

export default FakeUserProfilePage;