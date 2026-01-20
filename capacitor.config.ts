import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.animax.streaming',
  appName: 'Animax Streaming',
  webDir: 'out',
  server: {
    url: 'https://animax.click',
    allowNavigation: [
      'animax.click',
      '*.animax.click',
      'animax-streaming-plfm.vercel.app',
      '*.google.com',
      '*.googleapis.com',
      '*.gstatic.com'
    ],
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
