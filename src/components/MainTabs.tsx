
import React from "react";
import { MessageCircle, Heart, MapPin, Star } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface MainTabsProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  isAdminMode: boolean;
}

const tabs: Tab[] = [
  { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
  { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500' },
  { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500' },
  { id: 'timeline', label: 'Timeline', icon: Star, color: 'from-yellow-400 to-pink-500' }
];

export default function MainTabs({ activeTab, onTabChange, isAdminMode }: MainTabsProps) {
  if (isAdminMode) return null;
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-purple-100 px-4 py-3 shadow-sm">
      <div className="flex justify-center items-center max-w-lg mx-auto">
        <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
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
  );
}
