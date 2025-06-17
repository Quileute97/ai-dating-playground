
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Briefcase, GraduationCap, Ruler, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
                    className="rounded-lg object-cover w-full h-20 border"
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
    </div>
  );
};

export default UserProfilePage;
