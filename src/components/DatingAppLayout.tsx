import React from "react";

interface DatingAppLayoutProps {
  user: any;
  isAdminMode: boolean;
  isLeftPanelOpen: boolean;
  setIsLeftPanelOpen: (b: boolean) => void;
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (b: boolean) => void;
  children: React.ReactNode;
}

export default function DatingAppLayout({ children }: DatingAppLayoutProps) {
  return (
    <div className="flex-1 overflow-hidden relative">
      <div className="h-full flex flex-col">
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="h-full w-full overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
