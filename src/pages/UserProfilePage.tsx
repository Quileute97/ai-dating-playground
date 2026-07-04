
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, GraduationCap, Ruler, Clock, UserPlus, MessageCircle, Album, ArrowLeft, Home, Share2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSendFriendRequest, useFriendList, useSentFriendRequests } from "@/hooks/useFriends";
import { useToast } from "@/hooks/use-toast";

import { useFakeUserInteractions } from "@/hooks/useFakeUserInteractions";
import { useStars } from "@/hooks/useStars";
import DonateStarModal from "@/components/DonateStarModal";
import ProfileAlbumSection, { ProfileAlbumHandle } from "@/components/ProfileAlbumSection";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const albumRef = useRef<ProfileAlbumHandle>(null);
  
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
    
    // Đồng bộ: mọi cuộc trò chuyện đều mở trong tab Tin nhắn duy nhất
    supabase
      .from('fake_users')
      .select('id')
      .eq('id', userId)
      .single()
      .then(({ data: fakeUser }) => {
        if (fakeUser) {
          fakeUserInteractions.createConversationWithFakeUser(userId)
            .then(() => {
              navigate(`/messages?user=${userId}`);
            });
        } else {
          navigate(`/messages?user=${userId}`);
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
      <div className="min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
        {/* Header Navigation */}
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              onClick={handleBackClick}
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 text-slate-700 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 mr-1.5" />
              Quay lại
            </Button>

            <h1 className="font-semibold text-slate-800 text-sm tracking-wide">Hồ sơ cá nhân</h1>

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
                className="hover:bg-slate-100 text-slate-700 rounded-full"
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
                className="hover:bg-slate-100 text-slate-700 rounded-full"
              >
                <Home className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="flex justify-center items-start py-0 sm:py-8 px-0 sm:px-4">
          <div className="w-full max-w-[420px] bg-white sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden">

            {/* Hero / Cover Area */}
            <div className="relative h-[280px]">
              {profile.album && Array.isArray(profile.album) && profile.album.length > 0 ? (
                <>
                  <img
                    src={profile.album[0]}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Album count badge */}
                  <button
                    onClick={() => albumRef.current?.openGrid()}
                    className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 transition-colors border border-white/20"
                  >
                    <Album className="w-3.5 h-3.5" />
                    {profile.album.length} ảnh
                  </button>

                  {/* Thumbnail Strip */}
                  {profile.album.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 px-4">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {profile.album.slice(0, 5).map((img: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => albumRef.current?.openViewer(idx)}
                            className={`relative size-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${idx === 0 ? 'border-white shadow-lg' : 'border-white/40 hover:border-white/80'}`}
                          >
                            <img src={img} alt={`Ảnh ${idx + 1}`} className={`w-full h-full object-cover ${idx === 0 ? '' : 'opacity-90'}`} />
                            {idx === 4 && profile.album.length > 5 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-white text-xs font-bold">+{profile.album.length - 5}</span>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative h-full bg-gradient-to-br from-rose-200 via-pink-200 to-purple-200">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
              )}
            </div>

            {/* Profile Content */}
            <div className="px-6 -mt-10 relative pb-8">
              {/* Avatar + Status Row */}
              <div className="flex justify-between items-end mb-5">
                <div className="relative">
                  <div className="size-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                    <img
                      src={profile.avatar || '/placeholder.svg'}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {profile.is_dating_active && (
                    <div className="absolute bottom-1 right-1 bg-emerald-500 border-2 border-white size-5 rounded-full shadow-sm"></div>
                  )}
                </div>
                {profile.is_dating_active ? (
                  <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5 mb-1 border border-emerald-100">
                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Đang hoạt động</span>
                  </div>
                ) : (
                  <div className="bg-slate-100 px-3 py-1.5 rounded-full mb-1 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tạm dừng</span>
                  </div>
                )}
              </div>

              {/* Name + Chips */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.name}{profile.age ? `, ${profile.age}` : ''}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-medium border border-rose-100">
                    {getGenderDisplay(profile.gender)}
                  </span>
                  {profile.height && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 inline-flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      {profile.height}cm
                    </span>
                  )}
                  {profile.location_name && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100 inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.location_name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="grid grid-cols-12 gap-3 mb-8">
                  <Button
                    onClick={handleSendFriendRequest}
                    disabled={isAlreadyFriend || isRequestSent || sendFriendRequest.isPending}
                    className="col-span-5 h-12 bg-gradient-to-br from-rose-500 to-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-transform disabled:opacity-60 disabled:from-slate-300 disabled:to-slate-400 disabled:shadow-none"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    {isAlreadyFriend ? "Bạn bè" : isRequestSent ? "Đã gửi" : "Kết bạn"}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="col-span-5 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg shadow-slate-300 active:scale-95 transition-transform"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    Nhắn tin
                  </Button>
                  <button
                    onClick={() => setShowDonate(true)}
                    className="col-span-2 bg-amber-100 hover:bg-amber-200 flex items-center justify-center rounded-2xl active:scale-95 transition-transform"
                    aria-label="Tặng sao"
                  >
                    <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                  </button>
                </div>
              )}

              {isOwnProfile && (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-3 text-center mb-8 border border-slate-100">
                  <p className="text-slate-700 font-medium text-sm">✨ Đây là hồ sơ của bạn</p>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="mb-8">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Giới thiệu</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Detail Cards */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Nghề</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 line-clamp-2">{profile.job || '—'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Học vấn</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 line-clamp-2">{profile.education || '—'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Địa điểm</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 line-clamp-2">
                    {profile.location_name || (profile.lat && profile.lng ? `${parseFloat(profile.lat).toFixed(2)}, ${parseFloat(profile.lng).toFixed(2)}` : '—')}
                  </span>
                </div>
              </div>

              {/* Interests */}
              {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3">Sở thích</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((interest: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-slate-50 border border-slate-100 text-slate-700 hover:bg-slate-100 text-xs font-medium rounded-full px-3 py-1"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Album */}
              {/* Photo Album */}
              <ProfileAlbumSection
                userId={userId!}
                album={Array.isArray(profile.album) ? profile.album : []}
                isOwner={isOwnProfile}
                onAlbumChange={(next) => setProfile({ ...profile, album: next })}
              />

              {/* Footer */}
              <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-1">
                {profile.last_active && (
                  <span className="text-[10px] text-slate-400 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hoạt động lần cuối: {new Date(profile.last_active).toLocaleDateString('vi-VN')}
                  </span>
                )}
                <span className="text-[10px] font-medium text-slate-300 tracking-wider">ID: {profile.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat đã được đồng bộ vào tab Tin nhắn — không render cửa sổ chat riêng tại đây */}

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
