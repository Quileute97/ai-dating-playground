import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      .eq("id", userId) // id đã là uuid
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

  return (
    <div className="min-h-screen flex justify-center items-start bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 py-10">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <div className="flex flex-col items-center">
            <img
              src={profile.avatar || '/placeholder.svg'}
              alt={profile.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-purple-200 mb-2 bg-white"
            />
            <CardTitle className="text-center mt-2">{profile.name}</CardTitle>
            <div className="flex gap-2 mt-1 text-gray-600">
              {profile.age && <span>Tuổi: {profile.age}</span>}
              {profile.gender && <span>• {profile.gender}</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {profile.bio && (
            <div className="mb-4">
              <span className="font-semibold">Giới thiệu: </span>
              <span>{profile.bio}</span>
            </div>
          )}
          <div className="mb-4">
            <span className="font-semibold">Địa điểm: </span>
            <span>
              {profile.lat && profile.lng
                ? `${parseFloat(profile.lat).toFixed(4)}, ${parseFloat(profile.lng).toFixed(4)}`
                : "Chưa cập nhật"}
            </span>
          </div>
          {profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <div className="mb-4">
              <span className="font-semibold">Sở thích: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.interests.map((interest: string, idx: number) => (
                  <Badge key={idx} variant="secondary">{interest}</Badge>
                ))}
              </div>
            </div>
          )}
          <div className="text-sm text-gray-400 mt-8 text-right">
            ID: {profile.id}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePage;
