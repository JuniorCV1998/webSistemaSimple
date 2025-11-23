import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { StatusBar } from '@capacitor/status-bar';

// Evita que el WebView se meta debajo de las barras superior/inferior
//StatusBar.hide(); //oculta barras
//StatusBar.setOverlaysWebView({ overlay: false });


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
  
