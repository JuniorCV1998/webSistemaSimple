import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

/* import Aura from '@primeuix/themes/aura'; */
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialog } from 'primeng/dynamicdialog';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { loggingInterceptor } from './core/interceptor/logging.interceptor';

/* Firebase */
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        loggingInterceptor
      ])
    ),

    // Animaciones y PrimeNG
    importProvidersFrom([BrowserAnimationsModule, DynamicDialog]),
    MessageService,
    DialogService,
    { provide: LOCALE_ID, useValue: 'es' },

    //configuración del tema
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',           // prefijo para las variables CSS
          darkModeSelector: 'light', // system: negro, light: blanco
          cssLayer: true,
          colorScheme: 'light',  // fuerza el modo claro
          primary: 'emerald'        // color primario base (puede ser 'indigo', 'emerald', etc.)
        }
      }
    }),

    /* Firebase */
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyBfAzM45a5u5P_3zvniHgr4BwYltC9UCMs",
        authDomain: "facturationsystem-88520.firebaseapp.com",
        projectId: "facturationsystem-88520",
        storageBucket: "facturationsystem-88520.firebasestorage.app",
        messagingSenderId: "218957973541",
        appId: "1:218957973541:web:15dac81d11976729e0d7cc",
        measurementId: "G-X49ZL7CG5S"
      })
    ),
    provideStorage(() => getStorage()),
    /* Fin Firebase */

  ]
};
