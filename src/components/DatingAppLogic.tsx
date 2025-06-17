
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Regex kiểm tra UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useDatingAppLogic = (user: any, matchmaking: any) => {
  // Anonymous ID cho chat với người lạ khi chưa đăng nhập
  const [anonId, setAnonId] = useState<string | null>(null);
  
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

  const handleLogout = async () => {
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    setActiveTab("chat");
    matchmaking.reset();
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = (updatedUser: any) => {
    console.log("Profile updated:", updatedUser);
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleAdminToggle = () => {
    if (!isAdminMode) {
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

  return {
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
  };
};
