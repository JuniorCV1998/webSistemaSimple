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
    })
  ]
};
