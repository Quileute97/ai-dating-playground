
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Briefcase, GraduationCap, Ruler, Clock, UserPlus, MessageCircle, Album, X, ArrowLeft, Home, Share2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSendFriendRequest, useFriendList, useSentFriendRequests } from "@/hooks/useFriends";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfileChatWindow from "@/components/ProfileChatWindow";
import { useFakeUserInteractions } from "@/hooks/useFakeUserInteractions";
import { useStars } from "@/hooks/useStars";
import DonateStarModal from "@/components/DonateStarModal";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const { toast } = useToast();
  
  // Friend hooks
  const sendFriendRequest = useSendFriendRequest();
  const { data: friends } = useFriendList(currentUser?.id);
  const { data: sentRequests } = useSentFriendRequests(currentUser?.id);
  const fakeUserInteractions = useFakeUserInteractions(currentUser?.id);
  const { starBalance, donateStars } = useStars(currentUser?.id);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      console.log('Current user:', user);
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
        console.log('Profile data:', data);
        setProfile(data);
        setLoading(false);
      });
  }, [userId]);

  const handleSendFriendRequest = async () => {
    if (!currentUser || !userId) return;
    
    try {
      // Check if this is a fake user by trying to fetch from fake_users table
      const { data: fakeUser } = await supabase
        .from('fake_users')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (fakeUser) {
        // Send friend request to fake user
        await fakeUserInteractions.sendFriendRequestToFakeUser(userId);
      } else {
        // Send friend request to real user
        await sendFriendRequest.mutateAsync({
          user_id: currentUser.id,
          friend_id: userId,
        });
      }
      
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
    if (!currentUser || !userId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để nhắn tin",
        variant: "destructive",
      });
      return;
    }
    
    // Check if this is a fake user and create conversation accordingly
    supabase
      .from('fake_users')
      .select('id')
      .eq('id', userId)
      .single()
      .then(({ data: fakeUser }) => {
        if (fakeUser) {
          // Create conversation with fake user
          fakeUserInteractions.createConversationWithFakeUser(userId)
            .then(() => {
              setShowChatWindow(true);
            });
        } else {
          // Regular chat with real user
          setShowChatWindow(true);
        }
      });
  };

  const handleBackClick = () => {
    // Try to go back in history first, if no history then go to home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
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

  // Check if already friends or request sent
  const isAlreadyFriend = friends?.some(f => 
    (f.user_id === currentUser?.id && f.friend_id === userId) ||
    (f.friend_id === currentUser?.id && f.user_id === userId)
  );
  
  const isRequestSent = sentRequests?.some(r => r.friend_id === userId);
  const isOwnProfile = currentUser?.id === userId;

  console.log('Render conditions:', {
    currentUser: !!currentUser,
    isOwnProfile,
    isAlreadyFriend,
    isRequestSent,
    userId,
    currentUserId: currentUser?.id
  });

  return (
    <>
      <SEOHead 
        title={profile ? `${profile.name} - Hồ sơ người dùng | Hyliya` : "Hồ sơ người dùng | Hyliya"}
        description={profile?.bio || `Xem hồ sơ của ${profile?.name || 'người dùng'} trên Hyliya - Ứng dụng hẹn hò và kết nối thông minh.`}
        keywords={`${profile?.name || 'người dùng'}, hồ sơ, hẹn hò, kết nối, Hyliya`}
        image={profile?.avatar || "https://hyliya.com/og-image.jpg"}
        url={`https://hyliya.com/profile/${userId}`}
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
                  const url = `${window.location.origin}/profile/${userId}`;
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
        <div className="flex justify-center items-start py-0 px-0 sm:py-6 sm:px-4">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-sm sm:rounded-2xl shadow-xl overflow-hidden">
            
            {/* Hero Album Cover */}
            <div className="relative">
              {profile.album && Array.isArray(profile.album) && profile.album.length > 0 ? (
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <img
                    src={profile.album[0]}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Thumbnail strip */}
                  {profile.album.length > 1 && (
                    <div className="absolute bottom-16 left-3 right-3 flex gap-1.5">
                      {profile.album.slice(0, 5).map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setShowAlbumModal(true)}
                          className="relative flex-1 h-14 rounded-lg overflow-hidden border-2 border-white/50 hover:border-white transition-all duration-200 hover:scale-105 shadow-md"
                        >
                          <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                          {idx === 4 && profile.album.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+{profile.album.length - 5}</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Album count badge */}
                  <button
                    onClick={() => setShowAlbumModal(true)}
                    className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Album className="w-3.5 h-3.5" />
                    {profile.album.length} ảnh
                  </button>

                  {/* Name on cover */}
                  <div className="absolute bottom-3 left-3">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">{profile.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full">
                        {profile.age} tuổi
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full">
                        {getGenderDisplay(profile.gender)}
                      </span>
                      {profile.height && (
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Ruler className="w-3 h-3" />
                          {profile.height}cm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative h-40 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">{profile.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full">
                        {profile.age} tuổi
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2.5 py-0.5 rounded-full">
                        {getGenderDisplay(profile.gender)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Avatar overlapping */}
              <div className="absolute -bottom-10 right-4">
                <div className="relative">
                  <img
                    src={profile.avatar || '/placeholder.svg'}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl bg-white"
                  />
                  <div className="absolute -bottom-1 -right-1">
                    {getDatingStatus()}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-6 px-4 pb-6 space-y-4">
              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSendFriendRequest}
                    disabled={isAlreadyFriend || isRequestSent || sendFriendRequest.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md text-sm"
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    {isAlreadyFriend ? "Đã kết bạn" : isRequestSent ? "Đã gửi" : "Kết bạn"}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-md text-sm"
                    size="sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Nhắn tin
                  </Button>
                  <Button
                    onClick={() => setShowDonate(true)}
                    variant="outline"
                    className="border-yellow-300 text-yellow-600 hover:bg-yellow-50 shadow-sm"
                    size="sm"
                  >
                    <Star className="w-4 h-4 fill-yellow-400" />
                  </Button>
                </div>
              )}

              {isOwnProfile && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center">
                  <p className="text-purple-700 font-medium text-sm">✨ Đây là hồ sơ của bạn</p>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="font-semibold text-gray-800 text-sm block mb-2">💭 Giới thiệu</span>
                  <span className="text-gray-700 text-sm leading-relaxed">{profile.bio}</span>
                </div>
              )}

              {/* Info cards */}
              <div className="grid grid-cols-2 gap-2">
                {profile.job && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                    <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800 text-xs block">Nghề nghiệp</span>
                      <span className="text-gray-600 text-xs truncate block">{profile.job}</span>
                    </div>
                  </div>
                )}
                {profile.education && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                    <GraduationCap className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium text-gray-800 text-xs block">Học vấn</span>
                      <span className="text-gray-600 text-xs truncate block">{profile.education}</span>
                    </div>
                  </div>
                )}
                <div className={`flex items-center gap-2 p-3 bg-purple-50 rounded-xl ${!profile.job && !profile.education ? 'col-span-2' : ''}`}>
                  <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-gray-800 text-xs block">Địa điểm</span>
                    <span className="text-gray-600 text-xs truncate block">
                      {profile.location_name || (
                        profile.lat && profile.lng
                          ? `${parseFloat(profile.lat).toFixed(2)}, ${parseFloat(profile.lng).toFixed(2)}`
                          : "Chưa cập nhật"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interests */}
              {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <span className="font-semibold text-gray-800 text-sm block mb-2">🎯 Sở thích</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest: string, idx: number) => (
                      <Badge 
                        key={idx} 
                        variant="secondary"
                        className="bg-white border border-yellow-200 text-yellow-800 hover:bg-yellow-100 text-xs"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Album Grid - More prominent */}
              {profile.album && Array.isArray(profile.album) && profile.album.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                      📸 Album ảnh
                      <span className="bg-pink-200 text-pink-700 text-xs px-2 py-0.5 rounded-full">{profile.album.length}</span>
                    </span>
                    <Button
                      onClick={() => setShowAlbumModal(true)}
                      variant="ghost"
                      size="sm"
                      className="text-pink-600 hover:text-pink-700 hover:bg-pink-100 text-xs h-7"
                    >
                      Xem tất cả →
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {profile.album.slice(0, 6).map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                        onClick={() => setShowAlbumModal(true)}
                      >
                        <img
                          src={img}
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        {idx === 5 && profile.album.length > 6 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <span className="text-white font-bold text-lg">+{profile.album.length - 6}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.last_active && (
                <div className="flex items-center gap-2 text-xs text-gray-500 p-3 bg-gray-50 rounded-xl">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hoạt động lần cuối: {new Date(profile.last_active).toLocaleDateString('vi-VN')}</span>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center border-t pt-4">
                ID: {profile.id}
              </div>
            </div>
          </div>
        </div>

        {/* Album Modal - Improved for all devices */}
        <Dialog open={showAlbumModal} onOpenChange={setShowAlbumModal}>
          <DialogContent className="w-full h-full max-w-full max-h-full md:max-w-[90vw] md:max-h-[90vh] md:h-auto overflow-hidden p-0 bg-black/95 border-0 md:rounded-2xl gap-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAlbumModal(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-50 h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 shadow-lg"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            
            <div className="h-full flex flex-col p-4 md:p-6 lg:p-8">
              <h2 className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 pt-8 md:pt-0">
                <Album className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
                Album ảnh của {profile.name}
              </h2>
              
              <div className="flex-1 overflow-y-auto -mx-2 px-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-4">
                  {profile.album?.map((img: string, idx: number) => (
                    <div 
                      key={idx} 
                      className="relative group cursor-pointer overflow-hidden rounded-lg md:rounded-xl"
                    >
                      <div className="aspect-square w-full">
                        <img
                          src={img}
                          alt={`Ảnh ${idx + 1}`}
                          className="w-full h-full object-cover transform transition-all duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 md:pb-4">
                        <span className="text-white font-semibold text-sm md:text-base">
                          {idx + 1} / {profile.album.length}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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

export default UserProfilePage;
