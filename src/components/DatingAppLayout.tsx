
import React from "react";
import RealTimeActivityPanel from "./RealTimeActivityPanel";
import SidePanelToggle from "./SidePanelToggle";
import ActiveFriendsBottomPanel from "./ActiveFriendsBottomPanel";

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
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-row min-h-0">
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
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
        
        {/* BOTTOM: ActiveFriendsBottomPanel (chỉ user login) */}
        {!isAdminMode && user && (
          <ActiveFriendsBottomPanel 
            myId={user.id} 
            isOpen={isRightPanelOpen}
            onToggle={setIsRightPanelOpen}
          />
        )}
      </div>
    </div>
  );
}
