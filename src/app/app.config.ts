import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // ngPrime
import { importProvidersFrom } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MessagePopUpComponent } from './pages/modal/message-pop-up/message-pop-up.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { authInterceptor } from './core/interceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ 
    eventCoalescing: true }), 
    provideRouter(routes),provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom([BrowserAnimationsModule,DynamicDialogModule]),
    MessageService,DialogService 
  ],
};
