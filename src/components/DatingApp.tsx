import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, MapPin, Settings, Shield, User, LogOut, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';
import SwipeInterface from './SwipeInterface';
import NearbyInterface from './NearbyInterface';
import AdminDashboard from './AdminDashboard';
import FilterModal from './FilterModal';
import AuthModal from './AuthModal';
import UserProfile from './UserProfile';
import AIConfigModal from './AIConfigModal';
import AdminLogin from './AdminLogin';
import Timeline from './Timeline';
import RealTimeActivityPanel from './RealTimeActivityPanel';
import ActiveFriendsWithChatPanel from './ActiveFriendsWithChatPanel';
import { useStrangerMatchmaking } from "@/hooks/useStrangerMatchmaking";
import MainTabs from './MainTabs';
import SidePanelToggle from './SidePanelToggle';
import { supabase } from "@/integrations/supabase/client";

const DatingApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // State quản lý thu gọn/hiện 2 panel
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // ====== NEW: Matchmaking logic nâng lên DatingApp =======
  // Sử dụng user.id nếu có, hoặc anonId nếu chưa đăng nhập
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      // Chỉ tạo 1 lần duy nhất cho mỗi session (bằng localStorage)
      let storedAnonId = localStorage.getItem('anon_stranger_id');
      if (!storedAnonId) {
        storedAnonId = 'anon-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('anon_stranger_id', storedAnonId);
      }
      setAnonId(storedAnonId);
    }
  }, [user]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .then(({ data }) => {
          setIsAdminAuthenticated(data && data.length > 0);
        });
    } else {
      setIsAdminAuthenticated(false);
    }
  }, [user]);

  const tabs = [
    { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500', locked: false },
    { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500', locked: !user },
    { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500', locked: !user },
    { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500', locked: false }
  ];

  const handleLogin = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    if (isFirstTime) {
      setTimeout(() => setShowAIConfig(true), 500);
    }
  };

  const handleLogout = async () => {
    setUser(null);
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    setActiveTab('chat');
    matchmaking.reset?.();
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // TODO: Apply filters logic
  };

  // Điều chỉnh: Nếu tab bị khoá (locked) -> show modal đăng nhập, ngược lại chuyển tab
  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.locked) {
      setShowAuth(true);
    } else {
      setActiveTab(tabId);
    }
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

  const renderTabContent = () => {
    if (isAdminMode) {
      return <AdminDashboard />;
    }
    switch (activeTab) {
      case 'chat':
        return <ChatInterface
          user={user}
          isAdminMode={isAdminAuthenticated}
          matchmaking={matchmaking}
        />;
      case 'dating':
        // Nếu chưa login thì tab này không bao giờ tới được (chặn handleTabChange)
        return user ? <SwipeInterface user={user} /> : null;
      case 'nearby':
        return user ? <NearbyInterface user={user} /> : null;
      case 'timeline':
        return <Timeline user={user} />;
      default:
        return null;
    }
  };

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(true)}
              className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
            >
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover mr-2"
              />
              <span className="hidden sm:inline">{user.name}</span>
              <User className="w-4 h-4 sm:hidden" />
            </Button>
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
                ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg' 
                : 'bg-white/90 hover:bg-purple-50'
            }`}
          >
            <Shield className="w-4 h-4" />
          </Button>
          {/* Settings Button */}
          {!isAdminMode && activeTab === 'chat' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          {/* Logout Button */}
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

      {/* Tab Content + Side Panels */}
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
            <div key={activeTab} className="h-full animate-fade-in">
              {renderTabContent()}
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

      {/* Modals */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
      />
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
      />
      <AIConfigModal
        isOpen={showAIConfig}
        onClose={() => setShowAIConfig(false)}
      />
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default DatingApp;
