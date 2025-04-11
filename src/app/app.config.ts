import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // ngPrime
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptor/auth.interceptor';
import { loggingInterceptor } from './core/interceptor/logging.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registrar el locale español
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideZoneChangeDetection({ 
      eventCoalescing: true 
    }), 
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        loggingInterceptor // interceptor de logging
      ])
    ),
    importProvidersFrom([BrowserAnimationsModule, DynamicDialogModule]),
    MessageService,
    DialogService,
    { provide: LOCALE_ID, useValue: 'es' } // 👈 aquí el idioma
  ],
};
