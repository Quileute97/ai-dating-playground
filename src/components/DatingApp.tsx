
import React from "react";
import { MessageCircle, Heart, MapPin, Star } from "lucide-react";
import MainTabs from "./MainTabs";
import DatingAppHeader from "./DatingAppHeader";
import DatingAppContent from "./DatingAppContent";
import DatingAppLayout from "./DatingAppLayout";
import DatingAppModals from "./DatingAppModals";
import { useStrangerMatchmaking } from "@/hooks/useStrangerMatchmaking";
import { useUser } from "@/hooks/useUser";
import { useDatingProfile } from "@/hooks/useDatingProfile";
import { useDatingAppLogic } from "./DatingAppLogic";

const DatingApp = () => {
  // Sử dụng useUser centralized thay vì useDatingAppUser
  const { user, isLoading: userLoading, isAuthenticated } = useUser();
  
  // Dating profile hook
  const { profile: datingProfile, updateProfile: updateDatingProfile } = useDatingProfile(user?.id);

  // Kết nối matchmaking - không truyền tham số
  const matchmaking = useStrangerMatchmaking();

  // Custom hook cho logic
  const {
    anonId,
    activeTab,
    showFilters,
    setShowFilters,
    isAdminMode,
    showAuth,
    setShowAuth,
    showProfile,
    setShowProfile,
    showDatingProfile,
    setShowDatingProfile,
    showAIConfig,
    setShowAIConfig,
    showAdminLogin,
    setShowAdminLogin,
    isFirstTime,
    isAdminAuthenticated,
    isLeftPanelOpen,
    setIsLeftPanelOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    handleLogout,
    handleUpdateProfile,
    handleApplyFilters,
    handleTabChange,
    handleAdminToggle,
    handleAdminLogin,
  } = useDatingAppLogic(user, matchmaking);

  // Tab info: không khóa tab nào, tất cả đều visible
  const tabs = [
    { id: "chat", label: "Chat với người lạ", icon: MessageCircle, color: "from-purple-500 to-pink-500" },
    { id: "dating", label: "Hẹn hò", icon: Heart, color: "from-pink-500 to-red-500" },
    { id: "nearby", label: "Quanh đây", icon: MapPin, color: "from-blue-500 to-purple-500" },
    { id: "timeline", label: "Timeline", icon: Star, color: "from-yellow-400 to-pink-500" },
  ];

  // Combine user info with dating profile for display
  const combinedUser = user ? { ...user, ...datingProfile } : null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Tab Navigation */}
      <MainTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdminMode={isAdminMode}
        tabs={tabs}
        showLoginButton={!user}
        onLoginClick={() => setShowAuth(true)}
      />

      {/* Top Action Bar */}
      <DatingAppHeader
        user={user}
        combinedUser={combinedUser}
        isAdminMode={isAdminMode}
        activeTab={activeTab}
        onShowAuth={() => setShowAuth(true)}
        onShowProfile={() => setShowProfile(true)}
        onUpdateProfile={handleUpdateProfile}
        onAdminToggle={handleAdminToggle}
        onShowFilters={() => setShowFilters(true)}
        onLogout={handleLogout}
      />

      {/* Main Layout (side panels + content) */}
      <DatingAppLayout
        user={combinedUser}
        isAdminMode={isAdminMode}
        isLeftPanelOpen={isLeftPanelOpen}
        setIsLeftPanelOpen={setIsLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
        setIsRightPanelOpen={setIsRightPanelOpen}
      >
        <DatingAppContent
          activeTab={activeTab}
          isAdminMode={isAdminMode}
          user={user}
          isAdminAuthenticated={isAdminAuthenticated}
          anonId={anonId}
          onShowAuth={() => setShowAuth(true)}
        />
      </DatingAppLayout>

      {/* Modals */}
      <DatingAppModals
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        showDatingProfile={showDatingProfile}
        setShowDatingProfile={setShowDatingProfile}
        showAIConfig={showAIConfig}
        setShowAIConfig={setShowAIConfig}
        showAdminLogin={showAdminLogin}
        setShowAdminLogin={setShowAdminLogin}
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        user={combinedUser}
        onUpdateProfile={handleUpdateProfile}
        handleApplyFilters={handleApplyFilters}
        onAIConfigClose={() => setShowAIConfig(false)}
        onAdminLogin={handleAdminLogin}
        onAuthLogin={() => {
          setShowAuth(false);
          if (isFirstTime) {
            setTimeout(() => setShowAIConfig(true), 500);
          }
        }}
      />
    </div>
  );
};

export default DatingApp;
