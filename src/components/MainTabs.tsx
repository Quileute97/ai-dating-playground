import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Heart, MapPin, Star, Bell, Users } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface CustomTab extends Tab {
  locked?: boolean; // mở rộng props
}

interface MainTabsProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  isAdminMode: boolean;
  tabs?: CustomTab[]; // cho phép truyền custom tab
  showLoginButton?: boolean;
  onLoginClick?: () => void;
}

const tabs: Tab[] = [
  { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
  { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500' },
  { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500' },
  { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500' },
  { id: 'messages', label: 'Tin nhắn', icon: Users, color: 'from-blue-500 to-green-500' },
  { id: 'notifications', label: 'Thông báo', icon: Bell, color: 'from-orange-500 to-yellow-500' }
];

export default function MainTabs({ activeTab, onTabChange, isAdminMode, tabs: customTabs }: MainTabsProps) {
  const location = useLocation();
  
  // Mặc định dùng customTabs nếu truyền vào, fallback sang tabs cũ
  const displayTabs: CustomTab[] = customTabs || [
    { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500', locked: false },
    { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500', locked: true },
    { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500', locked: true },
    { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500', locked: false },
    { id: 'messages', label: 'Tin nhắn', icon: Users, color: 'from-blue-500 to-green-500', locked: false },
    { id: 'notifications', label: 'Thông báo', icon: Bell, color: 'from-orange-500 to-yellow-500', locked: true }
  ];
  
  if (isAdminMode) return null;
  
  // Check if we're on mobile/tablet - Show all 6 tabs on mobile, only 4 on desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024; // lg breakpoint
  const tabsToShow = isMobile ? displayTabs : displayTabs.slice(0, 4); // Only show first 4 tabs on desktop
  
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 px-1 sm:px-2 py-2 shadow-sm">
      <div className="flex justify-center items-center max-w-full mx-auto">
        <div className={`flex bg-gray-100 rounded-xl p-0.5 sm:p-1 gap-0.5 sm:gap-1 w-full ${isMobile ? 'max-w-full' : 'max-w-md'}`}>
          {tabsToShow.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = Boolean(tab.locked);
            const tabPath = tab.id === 'chat' ? '/' : `/${tab.id}`;

            const baseClassName = `flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 min-h-[48px] sm:min-h-[56px] py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg transition-all duration-300 relative touch-manipulation ${
              isActive 
                ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-md scale-[1.02]'
                : isLocked
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:scale-[1.01] hover:shadow-sm active:scale-[0.98]'
            }`;

            const content = (
              <>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 transition-all duration-200 ${isActive ? 'scale-105' : ''}`} />
                <span className={`${isMobile ? 'text-[7px] sm:text-[8px]' : 'text-[9px] sm:text-[10px] md:text-[9px]'} font-medium leading-tight text-center px-0.5 max-w-full break-words`}>
                  {tab.label}
                </span>
                {isLocked && (
                  <span className="absolute top-0.5 right-0.5 text-[8px] sm:text-[10px] text-gray-500">🔒</span>
                )}
              </>
            );

            if (isLocked) {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  disabled={true}
                  className={baseClassName}
                  title="Đăng nhập để dùng tính năng này"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={tab.id}
                to={tabPath}
                onClick={() => onTabChange(tab.id)}
                className={baseClassName}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}