
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useAdScriptLoader = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Check if we should load the script: user is authenticated and not on homepage
    const isHomePage = location.pathname === '/';
    const shouldLoadScript = user !== null && !isHomePage;
    
    // Handle script loading/unloading
    if (shouldLoadScript && !scriptLoaded) {
      // Load script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-noptimize', '1');
      script.setAttribute('data-cfasync', 'false');
      script.src = '//scripts.mediavine.com/tags/ballpark-savvy.js';
      script.id = 'mediavine-script';
      document.head.appendChild(script);
      setScriptLoaded(true);
    } else if (!shouldLoadScript && scriptLoaded) {
      // Remove script
      const script = document.getElementById('mediavine-script');
      if (script) {
        document.head.removeChild(script);
        setScriptLoaded(false);
      }
    }
    
    // Cleanup function to remove script when component unmounts
    return () => {
      const script = document.getElementById('mediavine-script');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, [location.pathname, user, scriptLoaded]);
};
