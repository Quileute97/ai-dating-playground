
import React from "react";
import RealTimeActivityPanel from "./RealTimeActivityPanel";
import SidePanelToggle from "./SidePanelToggle";
import ActiveFriendsWithChatPanel from "./ActiveFriendsWithChatPanel";

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
  return (
    <div className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-row">
        {/* LEFT: RealTimeActivityPanel (only nếu đã đăng nhập) */}
        {!isAdminMode && user && (
          isLeftPanelOpen ? (
            <div className="relative">
              <RealTimeActivityPanel userId={user?.id} />
              <SidePanelToggle
                isOpen={isLeftPanelOpen}
                side="left"
                onToggle={setIsLeftPanelOpen}
              />
            </div>
          ) : (
            <SidePanelToggle
              isOpen={isLeftPanelOpen}
              side="left"
              onToggle={setIsLeftPanelOpen}
            />
          )
        )}
        {/* CENTER: main tab content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-full">
            {children}
          </div>
        </div>
        {/* RIGHT: ActiveFriendsWithChatPanel (chỉ user login) */}
        {!isAdminMode && user && (
          isRightPanelOpen ? (
            <div className="relative">
              <ActiveFriendsWithChatPanel myId={user.id} />
              <SidePanelToggle
                isOpen={isRightPanelOpen}
                side="right"
                onToggle={setIsRightPanelOpen}
              />
            </div>
          ) : (
            <SidePanelToggle
              isOpen={isRightPanelOpen}
              side="right"
              onToggle={setIsRightPanelOpen}
            />
          )
        )}
      </div>
    </div>
  );
}
