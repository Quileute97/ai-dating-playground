
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import DatingProfile from './DatingProfile';

interface UnifiedProfileButtonProps {
  user: any;
  onUpdateProfile: (userData: any) => void;
  className?: string;
}

const UnifiedProfileButton = ({ user, onUpdateProfile, className }: UnifiedProfileButtonProps) => {
  const [showDatingProfile, setShowDatingProfile] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDatingProfile(true)}
        className={`bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm ${className}`}
      >
        <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover mr-2" />
        <span className="hidden sm:inline">{user.name}</span>
        <Heart className="w-4 h-4 sm:hidden text-pink-500" />
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

export default UnifiedProfileButton;
