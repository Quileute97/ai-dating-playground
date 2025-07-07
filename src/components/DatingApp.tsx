
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MainTabs from './MainTabs';
import DatingAppLayout from './DatingAppLayout';
import DatingAppModals from './DatingAppModals';
import UnifiedChatWidget from './UnifiedChatWidget';
import { ChatProvider } from '@/hooks/useChatContext';
import { useChatIntegration } from '@/hooks/useChatIntegration';

const DatingApp = () => {
  const [user, setUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Modal states
  const [showFilters, setShowFilters] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDatingProfile, setShowDatingProfile] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error fetching profile",
            description: "Failed to retrieve user profile data.",
            variant: "destructive",
          });
        } else {
          setUser(profileData);
        }
      }
    };

    fetchUser();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdminMode(false);
      }
    });
  }, [toast]);

  const handleUpdateProfile = async (updatedUser: any) => {
    const { error } = await supabase
      .from('profiles')
      .update(updatedUser)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update user profile data.",
        variant: "destructive",
      });
    } else {
      setUser(updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setShowProfile(false);
      setShowDatingProfile(false);
    }
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applying filters:', filters);
    toast({
      title: "Filters applied",
      description: "Your filters have been successfully applied.",
    });
  };

  const handleAdminLogin = (loggedInUser: any) => {
    setUser(loggedInUser);
    setIsAdminMode(true);
    setShowAdminLogin(false);
    toast({
      title: "Admin mode activated",
      description: "You are now in admin mode.",
    });
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error logging out",
        description: "Failed to log out.",
        variant: "destructive",
      });
    } else {
      setUser(null);
      setIsAdminMode(false);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const handleAuthLogin = async (userData: any) => {
    const { data: { user: authUser }, error } = await supabase.auth.signInWithOtp({ email: userData.email });
  
    if (error) {
      console.error('Error during authentication:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to authenticate. Please check your credentials.",
        variant: "destructive",
      });
    } else {
      setUser(userData);
      setShowAuth(false);
      toast({
        title: "Logged in",
        description: "You have been successfully logged in.",
      });
    }
  };

  const customTabs = [
    { id: 'chat', label: 'Chat với người lạ', icon: 'MessageCircle', color: 'from-purple-500 to-pink-500', locked: false },
    { id: 'dating', label: 'Hẹn hò', icon: 'Heart', color: 'from-pink-500 to-red-500', locked: !user },
    { id: 'nearby', label: 'Quanh đây', icon: 'MapPin', color: 'from-blue-500 to-purple-500', locked: !user },
    { id: 'timeline', label: 'Timeline', icon: 'Star', color: 'from-yellow-400 to-pink-500', locked: false }
  ];

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DatingAppLayout
          user={user}
          isAdminMode={isAdminMode}
          isLeftPanelOpen={isLeftPanelOpen}
          setIsLeftPanelOpen={setIsLeftPanelOpen}
          isRightPanelOpen={isRightPanelOpen}
          setIsRightPanelOpen={setIsRightPanelOpen}
        >
          <MainTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdminMode={isAdminMode}
            tabs={customTabs}
            showLoginButton={!user}
            onLoginClick={() => setShowAuth(true)}
          />
        </DatingAppLayout>

        <DatingAppModals
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          showDatingProfile={showDatingProfile}
          setShowDatingProfile={setShowDatingProfile}
          showAIConfig={showAIConfig}
          setShowAIConfig={setShowAIConfig}
          showAdminLogin={showAdminLogin}
          setShowAdminLogin={setShowAdminLogin}
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          user={user}
          onUpdateProfile={handleUpdateProfile}
          handleApplyFilters={handleApplyFilters}
          onAuthLogin={handleAuthLogin}
        />

        {/* Unified Chat Widget */}
        {user && <UnifiedChatWidget myUserId={user.id} />}
      </div>
    </ChatProvider>
  );
};

export default DatingApp;
