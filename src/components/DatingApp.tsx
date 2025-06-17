
import React, { useState, useEffect } from "react";
import { MessageCircle, Heart, MapPin, Settings, Shield, User, LogOut, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatInterface from "./ChatInterface";
import SwipeInterface from "./SwipeInterface";
import NearbyInterface from "./NearbyInterface";
import AdminDashboard from "./AdminDashboard";
import Timeline from "./Timeline";
import MainTabs from "./MainTabs";
import { useStrangerMatchmaking } from "@/hooks/useStrangerMatchmaking";
import DatingAppModals from "./DatingAppModals";
import DatingProfileButton from "./DatingProfileButton";
import RequireLogin from "./RequireLogin";
import DatingAppLayout from "./DatingAppLayout";
import { useUser } from "@/hooks/useUser";
import { useDatingProfile } from "@/hooks/useDatingProfile";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Regex kiểm tra UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DatingApp = () => {
  // Sử dụng useUser centralized thay vì useDatingAppUser
  const { user, isLoading: userLoading, isAuthenticated } = useUser();
  
  // Anonymous ID cho chat với người lạ khi chưa đăng nhập
  const [anonId, setAnonId] = useState<string | null>(null);
  
  // Dating profile hook
  const { profile: datingProfile, updateProfile: updateDatingProfile } = useDatingProfile(user?.id);

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

  // State quản lý thu gọn/hiện 2 panel
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // Kết nối matchmaking - không truyền tham số
  const matchmaking = useStrangerMatchmaking();

  // Tạo anonymous ID khi chưa đăng nhập
  useEffect(() => {
    if (!user) {
      let storedAnonId = localStorage.getItem("anon_stranger_id");
      // Nếu không đúng UUID hợp lệ, hoặc không tồn tại, tạo mới
      if (!storedAnonId || !UUID_REGEX.test(storedAnonId)) {
        storedAnonId = uuidv4();
        localStorage.setItem("anon_stranger_id", storedAnonId);
        console.log("[DatingApp] Đã tạo/ghi đè anon_stranger_id mới:", storedAnonId);
      }
      setAnonId(storedAnonId);
    }
  }, [user]);

  // Kiểm tra quyền admin mỗi khi user thay đổi
  useEffect(() => {
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .then(({ data }) => {
          setIsAdminAuthenticated(data && data.length > 0);
        });
    } else {
      setIsAdminAuthenticated(false);
    }
  }, [user]);

  // Tab info: không khóa tab nào, tất cả đều visible
  const tabs = [
    { id: "chat", label: "Chat với người lạ", icon: MessageCircle, color: "from-purple-500 to-pink-500" },
    { id: "dating", label: "Hẹn hò", icon: Heart, color: "from-pink-500 to-red-500" },
    { id: "nearby", label: "Quanh đây", icon: MapPin, color: "from-blue-500 to-purple-500" },
    { id: "timeline", label: "Timeline", icon: Star, color: "from-yellow-400 to-pink-500" },
  ];

  const handleLogout = async () => {
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    setActiveTab("chat");
    matchmaking.reset();
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = (updatedUser: any) => {
    // Profile updates are handled by the useUser hook automatically
    console.log("Profile updated:", updatedUser);
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
    // TODO: Apply filters logic
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
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
    setIsAdminMode(true);
    setIsAdminAuthenticated(true);
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
        return user ? <SwipeInterface user={user} /> : <RequireLogin onLogin={() => setShowAuth(true)} />;
      case "nearby":
        return user ? <NearbyInterface user={user} /> : <RequireLogin onLogin={() => setShowAuth(true)} />;
      case "timeline":
        return <Timeline user={user} />;
      default:
        return null;
    }
  };

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
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* User Info */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
              >
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover mr-2" />
                <span className="hidden sm:inline">{user.name}</span>
                <User className="w-4 h-4 sm:hidden" />
              </Button>
              <DatingProfileButton
                user={combinedUser}
                onUpdateProfile={handleUpdateProfile}
              />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuth(true)}
              className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
            >
              Đăng nhập
            </Button>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Admin Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdminToggle}
            className={`backdrop-blur-sm border-purple-200 shadow-sm transition-all duration-200 ${
              isAdminMode
                ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg"
                : "bg-white/90 hover:bg-purple-50"
            }`}
          >
            <Shield className="w-4 h-4" />
          </Button>
          {!isAdminMode && activeTab === "chat" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout (side panels + content) */}
      <DatingAppLayout
        user={combinedUser}
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
