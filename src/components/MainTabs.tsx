import React from "react";
import { MessageCircle, Heart, MapPin, Star } from 'lucide-react';

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
  { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500' }
];

export default function MainTabs({ activeTab, onTabChange, isAdminMode, tabs: customTabs }: MainTabsProps) {
  // Mặc định dùng customTabs nếu truyền vào, fallback sang tabs cũ
  const displayTabs: CustomTab[] = customTabs || [
    { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500', locked: false },
    { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500', locked: true },
    { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500', locked: true },
    { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500', locked: false }
  ];
  if (isAdminMode) return null;
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 px-2 py-1.5 shadow-sm">
      <div className="flex justify-center items-center max-w-lg mx-auto">
        <div className="flex bg-gray-100 rounded-xl p-0.5 gap-0.5">
          {displayTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = Boolean(tab.locked);

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                disabled={isLocked}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[60px] transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-md scale-102'
                    : isLocked
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:scale-101 hover:shadow-sm'
                }`}
                title={isLocked ? 'Đăng nhập để dùng tính năng này' : undefined}
              >
                <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? 'scale-105' : ''}`} />
                <span className="text-[10px] font-medium leading-tight">{tab.label}</span>
                {isLocked && (
                  <span className="absolute top-1 right-1 text-[8px] text-gray-500">🔒</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
