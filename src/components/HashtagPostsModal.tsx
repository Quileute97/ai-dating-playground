
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useTimelinePosts } from "@/hooks/useTimelinePosts";
import { getDefaultAvatar } from '@/utils/getDefaultAvatar';

interface HashtagPostsModalProps {
  hashtag: string;
  open: boolean;
  onClose: () => void;
  user: any;
}

export default function HashtagPostsModal({ hashtag, open, onClose, user }: HashtagPostsModalProps) {
  const { posts = [], isLoading } = useTimelinePosts(user?.id);

  const hashtagPosts = posts?.filter(
    (p: any) => typeof p.content === "string" && p.content.includes(`#${hashtag}`)
  );

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg w-full">
        <DialogTitle>
          Bài viết với #{hashtag}
        </DialogTitle>
        <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto">
          {isLoading && <div className="text-center py-6">Đang tải...</div>}
          {!isLoading && hashtagPosts.length === 0 && <div className="text-center py-6 text-gray-400">Không có bài viết nào.</div>}
          {hashtagPosts.map(post => (
            <Card key={post.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <img src={getDefaultAvatar(post.user_gender, post.user_avatar)} className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-gray-800">{post.user_name || "Ẩn danh"}</div>
                  <div className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("vi-VN")}</div>
                </div>
              </div>
              <div className="whitespace-pre-line">{post.content}</div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
