import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ssimple.app',
  appName: 'web-sistema-simple',
  webDir: 'dist/web-sistema-simple/browser',
  plugins: {
    Keyboard: {
      resizeOnFullScreen: false
    },
    // Más plugins se pueden añadir aquí
  }
};

export default config;
