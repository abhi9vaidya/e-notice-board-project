import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PasswordScreen from './PasswordScreen';
import Dashboard from './Dashboard';
import SplashScreen from '@/components/SplashScreen';

// main index page
// handles login and splash
const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // check if splash already shown
  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={2500} />;
  }

  if (!isAuthenticated) {
    return <PasswordScreen />;
  }

  return <Dashboard />;
};

export default Index;
