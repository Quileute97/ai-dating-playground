
import React, { useState } from 'react';
import { MessageCircle, Heart, MapPin, Settings, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatInterface from './ChatInterface';
import SwipeInterface from './SwipeInterface';
import NearbyInterface from './NearbyInterface';
import AdminDashboard from './AdminDashboard';
import FilterModal from './FilterModal';

const DatingApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showFilters, setShowFilters] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const tabs = [
    { id: 'chat', label: 'Chat với người lạ', icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
    { id: 'dating', label: 'Hẹn hò', icon: Heart, color: 'from-pink-500 to-red-500' },
    { id: 'nearby', label: 'Quanh đây', icon: MapPin, color: 'from-blue-500 to-purple-500' }
  ];

  const handleApplyFilters = (filters: any) => {
    console.log('Applied filters:', filters);
    // TODO: Apply filters logic
  };

  const renderTabContent = () => {
    if (isAdminMode) {
      return <AdminDashboard />;
    }

    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'dating':
        return <SwipeInterface />;
      case 'nearby':
        return <NearbyInterface />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Tab Navigation */}
      {!isAdminMode && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 px-4 py-2">
          <div className="flex justify-between items-center max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg scale-105' 
                      : 'text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {/* Admin Mode Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdminMode(!isAdminMode)}
          className={`backdrop-blur-sm border-purple-200 ${
            isAdminMode 
              ? 'bg-purple-500 text-white hover:bg-purple-600' 
              : 'bg-white/80 hover:bg-purple-50'
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
            className="bg-white/80 backdrop-blur-sm border-purple-200 hover:bg-purple-50"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default DatingApp;
