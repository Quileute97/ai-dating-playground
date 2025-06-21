
import React from "react";
import RealTimeActivityPanel from "./RealTimeActivityPanel";
import SidePanelToggle from "./SidePanelToggle";
import ActiveFriendsWithChatPanel from "./ActiveFriendsWithChatPanel";
import { useChatUserSelection } from "@/hooks/useChatUserSelection";

interface DatingAppLayoutProps {
  user: any;
  isAdminMode: boolean;
  isLeftPanelOpen: boolean;
  setIsLeftPanelOpen: (b: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (b: boolean) => void;
  children: React.ReactNode;
}

export default function DatingAppLayout({
  user,
  isAdminMode,
  isLeftPanelOpen,
  setIsLeftPanelOpen,
  isRightPanelOpen,
  setIsRightPanelOpen,
  children
}: DatingAppLayoutProps) {
  const { selectedChatUserId, selectUserForChat } = useChatUserSelection();

  return (
    <div className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-row">
        {/* LEFT: RealTimeActivityPanel (only nếu đã đăng nhập) */}
        {!isAdminMode && user && (
          isLeftPanelOpen ? (
            <div className="relative flex-shrink-0">
              <RealTimeActivityPanel userId={user?.id} />
              <SidePanelToggle
                isOpen={isLeftPanelOpen}
                side="left"
                onToggle={setIsLeftPanelOpen}
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <SidePanelToggle
                isOpen={isLeftPanelOpen}
                side="left"
                onToggle={setIsLeftPanelOpen}
              />
            </div>
          )
        )}
        
        {/* CENTER: main tab content - expanded to fill available space */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="h-full w-full overflow-auto">
            {children}
          </div>
        </div>
        
        {/* RIGHT: ActiveFriendsWithChatPanel (chỉ user login) */}
        {!isAdminMode && user && (
          isRightPanelOpen ? (
            <div className="relative flex-shrink-0">
              <ActiveFriendsWithChatPanel 
                myId={user.id}
                selectedChatUserId={selectedChatUserId}
                onChatUserChange={selectUserForChat}
              />
              <SidePanelToggle
                isOpen={isRightPanelOpen}
                side="right"
                onToggle={setIsRightPanelOpen}
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <SidePanelToggle
                isOpen={isRightPanelOpen}
                side="right"
                onToggle={setIsRightPanelOpen}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
