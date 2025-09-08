import React, { useState, useEffect } from "react";
import { MessageCircle, Heart, MapPin, Settings, Shield, User, LogOut, Star, Bell, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "./ChatInterface";
import SwipeInterface from "./SwipeInterface";
import NearbyInterface from "./NearbyInterface";
import AdminDashboard from "./AdminDashboard";
import Timeline from "./Timeline";
import MainTabs from "./MainTabs";
import { useStrangerMatchmaking } from "@/hooks/useStrangerMatchmaking";
import DatingAppModals from "./DatingAppModals";
import UnifiedProfileButton from "./UnifiedProfileButton";
import RequireLogin from "./RequireLogin";
import DatingAppLayout from "./DatingAppLayout";
import { useDatingAppUser } from "./hooks/useDatingAppUser";
import { useUnifiedProfile } from "@/hooks/useUnifiedProfile";
import { useGlobalSync } from "@/hooks/useGlobalSync";
import { ChatProvider } from "@/hooks/useChatContext";
import UnifiedChatWidget from "./UnifiedChatWidget";
import PremiumUpgradeModal from "./PremiumUpgradeModal";
import { useToast } from "@/hooks/use-toast";
import MessagesTab from "./MessagesTab";
import NotificationsTab from "./NotificationsTab";

const DatingApp = () => {
  const { toast } = useToast();
  
  // User/session quản lý bằng custom hook
  const { user, setUser, session, setSession, anonId } = useDatingAppUser();
  
  // Unified profile hook - thay thế useDatingProfile
  const { profile: unifiedProfile, updateProfile: updateUnifiedProfile } = useUnifiedProfile(user?.id);

  // Global sync hook để đồng bộ giữa các tab
  const { syncAll } = useGlobalSync(user?.id);

  const [activeTab, setActiveTab] = useState("chat");
  const [showFilters, setShowFilters] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDatingProfile, setShowDatingProfile] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // State quản lý thu gọn/hiện 2 panel
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Kết nối matchmaking - không truyền tham số
  const matchmaking = useStrangerMatchmaking();

  useEffect(() => {
    if (user) {
      import("@/integrations/supabase/client").then(({ supabase }) => {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .then(({ data }) => {
            setIsAdminAuthenticated(data && data.length > 0);
          });
      });
    } else {
      setIsAdminAuthenticated(false);
    }
  }, [user]);

  // Sync tất cả dữ liệu khi chuyển tab để đảm bảo consistency
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Trigger sync khi chuyển tab để đảm bảo dữ liệu được cập nhật
    setTimeout(() => {
      syncAll();
    }, 100);
  };

  const tabs = [
    { id: "chat", label: "Chat với người lạ", icon: MessageCircle, color: "from-purple-500 to-pink-500" },
    { id: "dating", label: "Hẹn hò", icon: Heart, color: "from-pink-500 to-red-500" },
    { id: "nearby", label: "Quanh đây", icon: MapPin, color: "from-blue-500 to-purple-500" },
    { id: "timeline", label: "Timeline", icon: Star, color: "from-yellow-400 to-pink-500" },
    { id: "messages", label: "Tin nhắn", icon: Users, color: "from-blue-500 to-green-500" },
    { id: "notifications", label: "Thông báo", icon: Bell, color: "from-orange-500 to-yellow-500" },
  ];

  const handleLogin = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    if (isFirstTime) {
      setTimeout(() => setShowAIConfig(true), 500);
    }
    // Sync sau khi login
    setTimeout(() => {
      syncAll();
    }, 1000);
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    setActiveTab("chat");
    matchmaking.reset();
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser);
    // Sync sau khi update profile
    setTimeout(() => {
      syncAll();
    }, 500);
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
    // TODO: Apply filters logic
  };

  const handleAdminToggle = () => {
    if (!isAdminMode) {
      // Chỉ cho mở admin dashboard khi có quyền admin
      if (!isAdminAuthenticated) {
        setShowAdminLogin(true);
      } else {
        setIsAdminMode(true);
      }
    } else {
      setIsAdminMode(false);
    }
  };

  const handleAdminLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
    setIsAdminMode(true);
    setIsAdminAuthenticated(true);
  };

  const handlePremiumUpgradeClick = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setShowPremiumModal(true);
  };

  const renderTabContent = () => {
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
        return user ? (
          <SwipeInterface 
            user={{ ...user, ...unifiedProfile }} 
            onPremiumUpgradeClick={handlePremiumUpgradeClick}
          />
        ) : <RequireLogin onLogin={() => setShowAuth(true)} />;
      case "nearby":
        return user ? <NearbyInterface user={{ ...user, ...unifiedProfile }} /> : <RequireLogin onLogin={() => setShowAuth(true)} />;
      case "timeline":
        return <Timeline user={{ ...user, ...unifiedProfile }} />;
      case "messages":
        return user ? (
          <MessagesTab userId={user.id} />
        ) : <RequireLogin onLogin={() => setShowAuth(true)} />;
      case "notifications":
        return user ? (
          <NotificationsTab userId={user.id} />
        ) : <RequireLogin onLogin={() => setShowAuth(true)} />;
      default:
        return null;
    }
  };

  return (
    <ChatProvider>
      <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-hidden">
        {/* Tab Navigation */}
        <MainTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isAdminMode={isAdminMode}
          tabs={tabs}
          showLoginButton={!user}
          onLoginClick={() => setShowAuth(true)}
        />

        {/* Top Action Bar - Optimized for mobile */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 z-20 flex justify-between items-center">
          {/* User Info */}
          <div className="flex items-center gap-1 md:gap-2">
            {user ? (
              <UnifiedProfileButton
                user={{ ...user, ...unifiedProfile }}
                onUpdateProfile={handleUpdateProfile}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuth(true)}
                className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm text-xs md:text-sm px-2 md:px-3"
              >
                <span className="hidden sm:inline">Đăng nhập</span>
                <User className="w-4 h-4 sm:hidden" />
              </Button>
            )}
          </div>
          {/* Action Buttons */}
          <div className="flex gap-1 md:gap-2">
            {/* Admin Mode Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdminToggle}
              className={`backdrop-blur-sm border-purple-200 shadow-sm transition-all duration-200 p-1 md:p-2 ${
                isAdminMode
                  ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg"
                  : "bg-white/90 hover:bg-purple-50"
              }`}
            >
              <Shield className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            {!isAdminMode && activeTab === "chat" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm p-1 md:p-2"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            )}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm p-1 md:p-2"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout (side panels + content) */}
        <DatingAppLayout
          user={user}
          isAdminMode={isAdminMode}
          isLeftPanelOpen={isLeftPanelOpen}
          setIsLeftPanelOpen={setIsLeftPanelOpen}
          isRightPanelOpen={isRightPanelOpen}
          setIsRightPanelOpen={setIsRightPanelOpen}
        >
          {renderTabContent()}
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
          user={{ ...user, ...unifiedProfile }}
          onUpdateProfile={handleUpdateProfile}
          handleApplyFilters={handleApplyFilters}
          onAIConfigClose={() => setShowAIConfig(false)}
          onAdminLogin={handleAdminLogin}
          onAuthLogin={handleLogin}
        />

        {/* Unified Chat Widget - only show when user is logged in */}
        {user && <UnifiedChatWidget myUserId={user.id} />}

        {/* Premium Upgrade Modal */}
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          userId={user?.id}
          userEmail={user?.email}
          onSuccess={() => {
            setShowPremiumModal(false);
            toast({
              title: "🎉 Chuyển hướng thành công!",
              description: "Hoàn tất thanh toán để kích hoạt Premium.",
            });
          }}
        />
      </div>
    </ChatProvider>
  );
};

export default DatingApp;
