import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c8b742f9f8624eb3b7796606d1ec3024',
  appName: 'o-esperto-comparador',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://c8b742f9-f862-4eb3-b779-6606d1ec3024.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;