
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, X, Clock, Heart } from "lucide-react";
import { useAcceptFriendRequest, useDeleteFriend } from "@/hooks/useFriends";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FriendRequestDetailModalProps {
  friendRequestId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FriendRequestData {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
}

interface ProfileData {
  id: string;
  name: string;
  avatar: string | null;
  age: number | null;
  bio?: string;
  location_name?: string;
}

export default function FriendRequestDetailModal({ friendRequestId, isOpen, onClose }: FriendRequestDetailModalProps) {
  const { toast } = useToast();
  const acceptRequest = useAcceptFriendRequest();
  const deleteRequest = useDeleteFriend();

  // Get friend request details
  const { data: friendRequest, isLoading: requestLoading } = useQuery({
    queryKey: ["friend-request-detail", friendRequestId],
    enabled: !!friendRequestId,
    queryFn: async () => {
      if (!friendRequestId) return null;
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("id", friendRequestId)
        .single();
      if (error) throw error;
      return data as FriendRequestData;
    }
  });

  // Get sender profile
  const { data: senderProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["sender-profile", friendRequest?.user_id],
    enabled: !!friendRequest?.user_id,
    queryFn: async () => {
      if (!friendRequest?.user_id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar, age, bio, location_name")
        .eq("id", friendRequest.user_id)
        .single();
      if (error) throw error;
      return data as ProfileData;
    }
  });

  const handleAcceptRequest = async () => {
    if (!friendRequestId || !senderProfile) return;
    
    try {
      await acceptRequest.mutateAsync(friendRequestId);
      toast({
        title: "🎉 Tuyệt vời!",
        description: `Bạn và ${senderProfile.name} giờ đã là bạn bè! Hãy bắt đầu trò chuyện nhé.`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
      onClose();
    } catch (error) {
      toast({
        title: "❌ Oops!",
        description: "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async () => {
    if (!friendRequestId || !senderProfile) return;
    
    try {
      await deleteRequest.mutateAsync(friendRequestId);
      toast({
        title: "👋 Đã từ chối",
        description: `Đã từ chối lời mời kết bạn từ ${senderProfile.name}`,
        className: "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200",
      });
      onClose();
    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể từ chối lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen || !friendRequestId) {
    return null;
  }

  const isLoading = requestLoading || profileLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Lời mời kết bạn
            </span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full"></div>
          </div>
        ) : senderProfile ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-lg">
                    <img 
                      src={senderProfile.avatar || '/placeholder.svg'} 
                      className="w-full h-full object-cover" 
                      alt={senderProfile.name}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 mb-1">{senderProfile.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    {senderProfile.age && (
                      <Badge variant="secondary" className="text-sm">
                        {senderProfile.age} tuổi
                      </Badge>
                    )}
                    {senderProfile.location_name && (
                      <Badge variant="outline" className="text-sm">
                        {senderProfile.location_name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Gửi lúc: {friendRequest && new Date(friendRequest.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>

              {senderProfile.bio && (
                <div className="bg-white/70 rounded-lg p-3 border border-purple-100">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {senderProfile.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAcceptRequest}
                disabled={acceptRequest.isPending}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Đồng ý kết bạn
              </Button>
              
              <Button
                onClick={handleRejectRequest}
                disabled={deleteRequest.isPending}
                variant="outline"
                className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold py-3 transition-all duration-200"
              >
                <X className="w-5 h-5 mr-2" />
                Từ chối
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Không thể tải thông tin lời mời kết bạn</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
