
import React from "react";
import RealTimeActivityPanel from "./RealTimeActivityPanel";
import SidePanelToggle from "./SidePanelToggle";
import TopDonateLeaderboard from "./TopDonateLeaderboard";

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
        {/* LEFT: RealTimeActivityPanel (only nếu đã đăng nhập) - Hidden on mobile */}
        {!isAdminMode && user && (
          isLeftPanelOpen ? (
            <div className="relative flex-shrink-0 hidden lg:block">
              <RealTimeActivityPanel userId={user?.id} />
              <SidePanelToggle
                isOpen={isLeftPanelOpen}
                side="left"
                onToggle={setIsLeftPanelOpen}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 hidden lg:block">
              <SidePanelToggle
                isOpen={isLeftPanelOpen}
                side="left"
                onToggle={setIsLeftPanelOpen}
              />
            </div>
          )
        )}
        
        {/* CENTER: main tab content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="h-full w-full overflow-auto">
            {children}
          </div>
        </div>
        
        {/* RIGHT: Top Donate Leaderboard - Hidden on mobile */}
        {!isAdminMode && (
          isRightPanelOpen ? (
            <div className="relative flex-shrink-0 hidden lg:block">
              <TopDonateLeaderboard />
              <SidePanelToggle
                isOpen={isRightPanelOpen}
                side="right"
                onToggle={setIsRightPanelOpen}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 hidden lg:block">
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
