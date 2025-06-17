
import React from "react";
import ChatInterface from "./ChatInterface";
import SwipeInterface from "./SwipeInterface";
import NearbyInterface from "./NearbyInterface";
import AdminDashboard from "./AdminDashboard";
import Timeline from "./Timeline";
import RequireLogin from "./RequireLogin";

interface DatingAppContentProps {
  activeTab: string;
  isAdminMode: boolean;
  user: any;
  isAdminAuthenticated: boolean;
  anonId: string | null;
  onShowAuth: () => void;
}

const DatingAppContent = ({
  activeTab,
  isAdminMode,
  user,
  isAdminAuthenticated,
  anonId,
  onShowAuth,
}: DatingAppContentProps) => {
  if (isAdminMode) {
    return <AdminDashboard />;
  }

  switch (activeTab) {
    case "chat":
      return (
        <ChatInterface
          user={user}
          isAdminMode={isAdminAuthenticated}
          anonId={anonId}
        />
      );
    case "dating":
      return user ? <SwipeInterface user={user} /> : <RequireLogin onLogin={onShowAuth} />;
    case "nearby":
      return user ? <NearbyInterface user={user} /> : <RequireLogin onLogin={onShowAuth} />;
    case "timeline":
      return <Timeline />;
    default:
      return null;
  }
};

export default DatingAppContent;
