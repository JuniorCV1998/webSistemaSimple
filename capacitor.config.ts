import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ssimple.app',
  appName: 'Ssimple Pay',
  webDir: 'dist/web-sistema-simple/browser',
  plugins: {
    Keyboard: {
      // Se mantiene el resize nativo (por defecto): las pantallas no usan <ion-content>,
      // así que resize 'ionic' dejaría los inputs tapados por el teclado.
      resizeOnFullScreen: false
    },
    SplashScreen: {
      // La app lo oculta cuando la primera pantalla terminó de navegar (app.component.ts),
      // así no se ve la pantalla en blanco mientras carga Angular.
      launchAutoHide: false,
      launchShowDuration: 0,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: false,
      splashImmersive: false
    },
    // Más plugins se pueden añadir aquí
  }
};

export default config;
