
import React from 'react';
import { useAdScriptLoader } from '@/hooks/useAdScriptLoader';

const AdScriptManager: React.FC = () => {
  // The hook handles all the logic
  useAdScriptLoader();
  
  // This component doesn't render anything visible
  return null;
};

export default AdScriptManager;
