
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, User } from 'lucide-react';
import DatingProfile from './DatingProfile';

interface DatingProfileButtonProps {
  user: any;
  onUpdateProfile: (userData: any) => void;
  className?: string;
}

const DatingProfileButton = ({ user, onUpdateProfile, className }: DatingProfileButtonProps) => {
  const [showDatingProfile, setShowDatingProfile] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDatingProfile(true)}
        className={`bg-white/90 backdrop-blur-sm border-pink-200 hover:bg-pink-50 shadow-sm ${className}`}
      >
        <Heart className="w-4 h-4 mr-1 text-pink-500" />
        <span className="hidden sm:inline">Hồ sơ hẹn hò</span>
        <User className="w-4 h-4 sm:hidden" />
      </Button>

      <DatingProfile
        isOpen={showDatingProfile}
        onClose={() => setShowDatingProfile(false)}
        user={user}
        onUpdateProfile={onUpdateProfile}
      />
    </>
  );
};

export default DatingProfileButton;
