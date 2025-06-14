
import React from "react";
import FilterModal from "./FilterModal";
import UserProfile from "./UserProfile";
import AIConfigModal from "./AIConfigModal";
import AdminLogin from "./AdminLogin";
import AuthModal from "./AuthModal";

export interface DatingAppModalsProps {
  showFilters: boolean;
  setShowFilters: (b: boolean) => void;
  showProfile: boolean;
  setShowProfile: (b: boolean) => void;
  showAIConfig: boolean;
  setShowAIConfig: (b: boolean) => void;
  showAdminLogin: boolean;
  setShowAdminLogin: (b: boolean) => void;
  showAuth: boolean;
  setShowAuth: (b: boolean) => void;
  user: any;
  onUpdateProfile: (u: any) => void;
  handleApplyFilters: (f: any) => void;
  onAIConfigClose?: () => void;
  onAdminLogin?: (loggedInUser: any) => void;
  onAuthLogin: (userData: any) => void;
}

export default function DatingAppModals(props: DatingAppModalsProps) {
  const {
    showFilters,
    setShowFilters,
    showProfile,
    setShowProfile,
    showAIConfig,
    setShowAIConfig,
    showAdminLogin,
    setShowAdminLogin,
    showAuth,
    setShowAuth,
    user,
    onUpdateProfile,
    handleApplyFilters,
    onAIConfigClose,
    onAdminLogin,
    onAuthLogin,
  } = props;

  return (
    <>
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
      />
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUpdateProfile={onUpdateProfile}
      />
      <AIConfigModal
        isOpen={showAIConfig}
        onClose={onAIConfigClose || (() => setShowAIConfig(false))}
      />
      <AdminLogin
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={onAdminLogin || (() => {})}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={onAuthLogin}
      />
    </>
  );
}
