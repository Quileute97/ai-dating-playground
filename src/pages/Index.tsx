import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import LandingPage from "./LandingPage";
import DatingApp from "@/components/DatingApp";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show landing page for unauthenticated users
  if (isAuthenticated === false) {
    return <LandingPage />;
  }

  // Show app for authenticated users
  if (isAuthenticated === true) {
    return <DatingApp />;
  }

  // Loading state
  return null;
};

export default Index;
