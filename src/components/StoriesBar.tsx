import React, { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStories, GroupedStories } from "@/hooks/useStories";
import StoryViewer from "./StoryViewer";
import CreateStoryModal from "./CreateStoryModal";

interface StoriesBarProps {
  user: any;
  userProfile: any;
}

const StoriesBar: React.FC<StoriesBarProps> = ({ user, userProfile }) => {
  const { groupedStories, isLoading, hasMyStory } = useStories(user?.id);
  const [viewingStory, setViewingStory] = useState<GroupedStories | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-gray-200" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Put current user's story first
  const sortedStories = [...groupedStories].sort((a, b) => {
    if (a.user_id === user?.id) return -1;
    if (b.user_id === user?.id) return 1;
    return 0;
  });

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Story Button */}
        {user?.id && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
          >
            <div className="relative">
              <div className={cn(
                "w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden",
                hasMyStory 
                  ? "border-transparent bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5" 
                  : "border-gray-300 border-dashed"
              )}>
                {hasMyStory ? (
                  <img
                    src={userProfile?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"}
                    alt="Your story"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-gray-500" />
                  </div>
                )}
              </div>
              {!hasMyStory && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 truncate w-16 text-center">
              {hasMyStory ? "Story của bạn" : "Thêm Story"}
            </span>
          </button>
        )}

        {/* Other users' stories */}
        {sortedStories
          .filter((s) => s.user_id !== user?.id)
          .map((group) => (
            <button
              key={group.user_id}
              onClick={() => setViewingStory(group)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5">
                <img
                  src={group.user_avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + group.user_id}
                  alt={group.user_name}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
              <span className="text-xs text-gray-600 truncate w-16 text-center">
                {group.user_name}
              </span>
            </button>
          ))}
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <StoryViewer
          stories={viewingStory.stories}
          userName={viewingStory.user_name}
          userAvatar={viewingStory.user_avatar}
          onClose={() => setViewingStory(null)}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={user?.id}
      />
    </>
  );
};

export default StoriesBar;
