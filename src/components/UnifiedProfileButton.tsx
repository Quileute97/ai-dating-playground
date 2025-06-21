
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import UserProfile from './UserProfile';
import DatingProfile from './DatingProfile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UnifiedProfileButtonProps {
  user: any;
  onUpdateProfile: (userData: any) => void;
  className?: string;
}

const UnifiedProfileButton = ({ user, onUpdateProfile, className }: UnifiedProfileButtonProps) => {
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showDatingProfile, setShowDatingProfile] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`bg-white/90 backdrop-blur-sm border-purple-200 hover:bg-purple-50 shadow-sm ${className}`}
          >
            <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover mr-2" />
            <span className="hidden sm:inline">{user.name}</span>
            <User className="w-4 h-4 sm:hidden" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
            <User className="w-4 h-4 mr-2" />
            Hồ sơ của tôi
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDatingProfile(true)}>
            <User className="w-4 h-4 mr-2" />
            Hồ sơ hẹn hò
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        user={user}
        onUpdateProfile={onUpdateProfile}
      />

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
