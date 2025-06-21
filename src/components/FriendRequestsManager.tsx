
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, X, Clock, Heart, Users } from "lucide-react";
import { useReceivedFriendRequests, useAcceptFriendRequest, useDeleteFriend } from "@/hooks/useFriends";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FriendRequestsManagerProps {
  myId: string;
}

interface ProfileData {
  id: string;
  name: string;
  avatar: string | null;
  age: number | null;
}

export default function FriendRequestsManager({ myId }: FriendRequestsManagerProps) {
  const { toast } = useToast();
  const { data: receivedRequests, isLoading } = useReceivedFriendRequests(myId);
  const acceptRequest = useAcceptFriendRequest();
  const deleteRequest = useDeleteFriend();

  // Get profiles for all friend request senders
  const senderIds = receivedRequests?.map(request => request.user_id) || [];
  
  const { data: senderProfiles } = useQuery({
    queryKey: ["friend-request-profiles", senderIds],
    enabled: senderIds.length > 0,
    queryFn: async () => {
      if (senderIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, avatar, age")
        .in("id", senderIds);
      if (error) throw error;
      return data as ProfileData[];
    }
  });

  const handleAcceptRequest = async (requestId: string, senderName: string) => {
    try {
      await acceptRequest.mutateAsync(requestId);
      toast({
        title: "🎉 Tuyệt vời!",
        description: `Bạn và ${senderName} giờ đã là bạn bè! Hãy bắt đầu trò chuyện nhé.`,
        className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
      });
    } catch (error) {
      toast({
        title: "❌ Oops!",
        description: "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, senderName: string) => {
    try {
      await deleteRequest.mutateAsync(requestId);
      toast({
        title: "👋 Đã từ chối",
        description: `Đã từ chối lời mời kết bạn từ ${senderName}`,
        className: "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200",
      });
    } catch (error) {
      toast({
        title: "❌ Lỗi",
        description: "Không thể từ chối lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-white to-purple-50/30 border border-purple-100 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Lời mời kết bạn
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-8 h-8 border-3 border-purple-200 border-t-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Đang tải lời mời...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!receivedRequests || receivedRequests.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lời mời kết bạn
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="relative mb-4">
              <Clock className="w-12 h-12 opacity-30" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="font-semibold text-gray-600 mb-2">Chưa có lời mời nào</h3>
            <p className="text-sm text-center text-gray-500 leading-relaxed">
              Khi có người gửi lời mời kết bạn,<br />
              bạn sẽ thấy thông báo ở đây
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-pink-50/30 border border-pink-100 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="pb-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 animate-pulse"></div>
        </div>
        <CardTitle className="relative text-lg font-bold text-gray-800 flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full shadow-lg">
              <Heart className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Lời mời kết bạn
            </span>
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md animate-pulse px-3 py-1">
              <span className="font-bold">{receivedRequests.length}</span>
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {receivedRequests.map((request, index) => {
          const senderProfile = senderProfiles?.find(p => p.id === request.user_id);
          
          return (
            <div
              key={request.id}
              className="group relative bg-gradient-to-r from-white via-purple-50/30 to-pink-50/30 rounded-xl border border-purple-100 p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-purple-200"
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img 
                      src={senderProfile?.avatar || '/placeholder.svg'} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                      alt={senderProfile?.name || 'User'}
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <UserPlus className="w-3 h-3 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-base truncate mb-1">
                    {senderProfile?.name || 'Người dùng'}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {senderProfile?.age ? `${senderProfile.age} tuổi` : 'Muốn kết bạn với bạn'}
                    </span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
                    <span className="text-purple-600 font-medium">Lời mời mới</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAcceptRequest(request.id, senderProfile?.name || 'Người dùng')}
                    disabled={acceptRequest.isPending}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 h-9 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Đồng ý
                  </Button>
                  
                  <Button
                    onClick={() => handleRejectRequest(request.id, senderProfile?.name || 'Người dùng')}
                    disabled={deleteRequest.isPending}
                    variant="outline"
                    size="sm"
                    className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 h-9 text-sm font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
}
