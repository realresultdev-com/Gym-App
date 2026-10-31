import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.realresultdev.realfit',
  appName: 'Real Fit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
