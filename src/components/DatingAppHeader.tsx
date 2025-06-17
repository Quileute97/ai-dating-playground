
import React from "react";
import { Settings, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatingProfileButton from "./DatingProfileButton";

interface DatingAppHeaderProps {
  user: any;
  combinedUser: any;
  isAdminMode: boolean;
  activeTab: string;
  onShowAuth: () => void;
  onShowProfile: () => void;
  onUpdateProfile: (user: any) => void;
  onAdminToggle: () => void;
  onShowFilters: () => void;
  onLogout: () => void;
}

const DatingAppHeader = ({
  user,
  combinedUser,
  isAdminMode,
  activeTab,
  onShowAuth,
  onShowProfile,
  onUpdateProfile,
  onAdminToggle,
  onShowFilters,
  onLogout,
}: DatingAppHeaderProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
      {/* User Info */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onShowProfile}
              className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
            >
              <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover mr-2" />
              <span className="hidden sm:inline">{user.name}</span>
              <Settings className="w-4 h-4 sm:hidden" />
            </Button>
            <DatingProfileButton
              user={combinedUser}
              onUpdateProfile={onUpdateProfile}
            />
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowAuth}
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
          onClick={onAdminToggle}
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
            onClick={onShowFilters}
            className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
        {user && (
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DatingAppHeader;
