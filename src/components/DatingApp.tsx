
import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, MapPin, Settings, Shield, User, LogOut } from 'lucide-react';
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

const DatingApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowAuth(true);
      localStorage.setItem('hasVisited', 'true');
    } else {
      setIsFirstTime(false);
    }
  }, []);

  const tabs = [
    { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
    { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500' },
    { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500' }
  ];

  const handleLogin = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    // Show AI config for first-time users
    if (isFirstTime) {
      setTimeout(() => setShowAIConfig(true), 500);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdminMode(false);
    setIsAdminAuthenticated(false);
    setActiveTab('chat');
  };

  const handleUpdateProfile = (updatedUser: any) => {
    setUser(updatedUser);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // TODO: Apply filters logic
  };

  const handleTabChange = (tabId: string) => {
    console.log('Switching to tab:', tabId);
    setActiveTab(tabId);
  };

  const handleAdminToggle = () => {
    if (!isAdminMode) {
      // Trying to enter admin mode - require authentication
      if (!isAdminAuthenticated) {
        setShowAdminLogin(true);
      } else {
        setIsAdminMode(true);
      }
    } else {
      // Exiting admin mode
      setIsAdminMode(false);
    }
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setIsAdminMode(true);
  };

  const renderTabContent = () => {
    if (isAdminMode) {
      return <AdminDashboard />;
    }

    switch (activeTab) {
      case 'chat':
        return <ChatInterface user={user} isAdminMode={isAdminAuthenticated} />;
      case 'dating':
        return <SwipeInterface user={user} />;
      case 'nearby':
        return <NearbyInterface user={user} />;
      default:
        return null;
    }
  };

  // Show welcome screen if no user
  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-8 text-center bg-white/70 backdrop-blur-sm border-purple-200 animate-fade-in">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Chào mừng đến Love App</h1>
            <p className="text-gray-600 mb-6">Kết nối, trò chuyện và tìm kiếm tình yêu cùng AI thông minh</p>
            <Button 
              onClick={() => setShowAuth(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              Bắt đầu ngay
            </Button>
          </Card>
        </div>

        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Tab Navigation */}
      {!isAdminMode && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 px-4 py-3 shadow-sm">
          <div className="flex justify-center items-center max-w-lg mx-auto">
            <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out transform min-w-[80px] ${
                      isActive 
                        ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg scale-105 -translate-y-0.5' 
                        : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:scale-102 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-xs font-medium leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
        {/* User Info */}
        <div className="flex items-center gap-2">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        <div key={activeTab} className="h-full animate-fade-in">
          {renderTabContent()}
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
    </div>
  );
};

export default DatingApp;
