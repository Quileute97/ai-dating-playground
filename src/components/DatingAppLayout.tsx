
import React, { useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, MessageCircle, User, Sparkles } from "lucide-react";
import SwipeInterface from "./SwipeInterface";
import Timeline, { TimelineRef } from "./Timeline";
import NearbyWrapper from "./NearbyWrapper";
import UserProfile from "./UserProfile";
import RealTimeActivityPanel from "./RealTimeActivityPanel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LayoutProps {
  user: any;
  activeTab: string;
  onTabChange: (value: string) => void;
  children?: React.ReactNode;
}

export default function DatingAppLayout({ user, activeTab, onTabChange, children }: LayoutProps) {
  const timelineRef = useRef<TimelineRef>(null);

  const handleScrollToPost = (postId: string) => {
    // Switch to timeline tab if not already active
    if (activeTab !== "timeline") {
      onTabChange("timeline");
      // Wait for tab switch to complete before scrolling
      setTimeout(() => {
        timelineRef.current?.scrollToPost(postId);
      }, 100);
    } else {
      timelineRef.current?.scrollToPost(postId);
    }
  };

  // If children are provided, render them directly (for backward compatibility)
  if (children) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <RealTimeActivityPanel 
          userId={user?.id} 
          onScrollToPost={handleScrollToPost}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
          <div className="bg-white/70 backdrop-blur-sm border-b border-white/20 px-4 py-2">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="dating" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Hẹn hò</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Timeline</span>
              </TabsTrigger>
              <TabsTrigger value="nearby" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Gần bạn</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Hồ sơ</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <TabsContent value="dating" className="mt-0 h-full">
                <SwipeInterface user={user} />
              </TabsContent>
              <TabsContent value="timeline" className="mt-0 h-full">
                <Timeline ref={timelineRef} user={user} />
              </TabsContent>
              <TabsContent value="nearby" className="mt-0 h-full">
                <NearbyWrapper user={user} />
              </TabsContent>
              <TabsContent value="profile" className="mt-0 h-full">
                <div className="p-4">
                  <UserProfile 
                    isOpen={true}
                    onClose={() => {}}
                    user={user}
                    onUpdateProfile={() => {}}
                  />
                </div>
              </TabsContent>
            </div>

            {/* Right Panel - Activity Feed */}
            <RealTimeActivityPanel 
              userId={user?.id} 
              onScrollToPost={handleScrollToPost}
            />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
