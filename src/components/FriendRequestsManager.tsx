
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, UserCheck, X, Clock } from "lucide-react";
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
        title: "Đã chấp nhận lời mời kết bạn",
        description: `Bạn và ${senderName} giờ đã là bạn bè!`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, senderName: string) => {
    try {
      await deleteRequest.mutateAsync(requestId);
      toast({
        title: "Đã từ chối lời mời kết bạn",
        description: `Đã từ chối lời mời kết bạn từ ${senderName}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối lời mời kết bạn. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Lời mời kết bạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 py-4 text-center text-sm">
            <div className="animate-pulse">Đang tải...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!receivedRequests || receivedRequests.length === 0) {
    return (
      <Card className="bg-white border shadow-sm rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Lời mời kết bạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-400 py-4 text-center text-sm">
            <Clock className="mx-auto mb-2 w-6 h-6 opacity-50" />
            Chưa có lời mời kết bạn nào
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border shadow-sm rounded-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Lời mời kết bạn
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {receivedRequests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {receivedRequests.map((request) => {
          const senderProfile = senderProfiles?.find(p => p.id === request.user_id);
          
          return (
            <div
              key={request.id}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
            >
              <div className="relative">
                <img 
                  src={senderProfile?.avatar || '/placeholder.svg'} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                  alt={senderProfile?.name || 'User'}
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <UserPlus className="w-2 h-2 text-white" />
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm truncate">
                  {senderProfile?.name || 'Người dùng'}
                </div>
                <div className="text-xs text-gray-500">
                  {senderProfile?.age ? `${senderProfile.age} tuổi` : 'Muốn kết bạn với bạn'}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAcceptRequest(request.id, senderProfile?.name || 'Người dùng')}
                  disabled={acceptRequest.isPending}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1 h-8 text-xs"
                >
                  <UserCheck className="w-3 h-3 mr-1" />
                  Đồng ý
                </Button>
                
                <Button
                  onClick={() => handleRejectRequest(request.id, senderProfile?.name || 'Người dùng')}
                  disabled={deleteRequest.isPending}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 px-3 py-1 h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Từ chối
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
