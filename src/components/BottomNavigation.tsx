import React from "react";
import { MessageCircle, Heart, MapPin, Star, Bell, Users } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface CustomTab extends Tab {
  locked?: boolean;
  badge?: number;
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  isAdminMode: boolean;
  tabs?: CustomTab[];
}

const defaultTabs: CustomTab[] = [
  { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500', locked: false },
  { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500', locked: false },
  { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500', locked: false },
  { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500', locked: false },
  { id: 'messages', label: 'Tin nhắn', icon: Users, color: 'from-blue-500 to-green-500', locked: false },
  { id: 'notifications', label: 'Thông báo', icon: Bell, color: 'from-orange-500 to-yellow-500', locked: false }
];

export default function BottomNavigation({ activeTab, onTabChange, isAdminMode, tabs: customTabs }: BottomNavigationProps) {
  const displayTabs: CustomTab[] = customTabs || defaultTabs;
  
  if (isAdminMode) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-purple-100 px-2 py-2 shadow-lg z-30">
      <div className="flex justify-center items-center max-w-full mx-auto">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-full max-w-lg">
          {displayTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = Boolean(tab.locked);
            const badge = tab.badge || 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                disabled={isLocked}
                className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[60px] py-2 px-1 rounded-lg transition-all duration-300 relative touch-manipulation ${
                  isActive 
                    ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-md scale-[1.02]'
                    : isLocked
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:scale-[1.01] hover:shadow-sm active:scale-[0.98]'
                }`}
                title={isLocked ? 'Đăng nhập để dùng tính năng này' : undefined}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-105' : ''}`} />
                  {badge > 0 && !isActive && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-tight text-center px-0.5 max-w-full break-words">
                  {tab.label}
                </span>
                {isLocked && (
                  <span className="absolute top-1 right-1 text-[10px] text-gray-500">🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
