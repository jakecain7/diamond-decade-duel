
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f99444e2fe09410988389c4a73557d47',
  appName: 'diamond-decade-duel',
  webDir: 'dist',
  server: {
    url: 'https://f99444e2-fe09-4109-8838-9c4a73557d47.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
