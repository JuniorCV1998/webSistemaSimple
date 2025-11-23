
import { Keyboard } from '@capacitor/keyboard';
import { App as CapacitorApp } from '@capacitor/app';
import { NavegationComponent } from './pages/nav/navegation/navegation.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaintenanceSocketService } from './core/services/mantenimiento/maintenance-socket.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavegationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'WebSistemaSimple';
  confetti: boolean = false;

  constructor(
    private router: Router,
    private maintenanceSocketService: MaintenanceSocketService
  ) {
    this.initStatusBar();
  }

  private async initStatusBar() {
    // Barra superior
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Light });

    // Barra inferior
    await EdgeToEdge.enable(); // activa el edge-to-edge
  }

  ngOnInit() {
    // Habilita desplazamiento automático con teclado
    Keyboard.setScroll({ isDisabled: false });

    CapacitorApp.addListener('backButton', () => {
      const currentUrl = this.router.url.split('?')[0];

      const blockedRoutesWithConfetti = [
        '/registrar/inversiondetalle',
        '/vehicular/registro/inversiondetalle'
      ];

      const alwaysBlockedRoutes = [
        '/vehicular/inicio',
        '/reporte/reporte-cobranza'
      ];

      const exitAppRoutes = [
        '/inicio',
        '/login-user',
        '/login'
      ];

      const AppInvVehRoutes = [
        '/vehicular/inversiondetalle'
      ];

      this.setearValueConfetti();

      // Bloqueo fijo sin importar confetti
      if (alwaysBlockedRoutes.includes(currentUrl)) {
        //alert("Botón atrás bloqueado SIEMPRE en: " + currentUrl);
        return;
      }

      // Bloqueo condicional con confetti
      if (blockedRoutesWithConfetti.includes(currentUrl) && this.confetti) {
        //alert("Botón atrás bloqueado por confetti en: " + currentUrl);
        return;
      }

      // Redirigir a inicio vehicular
      if (AppInvVehRoutes.includes(currentUrl)) {
        this.router.navigateByUrl('/vehicular/inicio');
        return;
      }

      // Redirigir a inicio si confetti === true en otras rutas
      if (this.confetti) {
        this.router.navigateByUrl('/inicio');
        return;
      }

      // Salir de la app
      if (exitAppRoutes.includes(currentUrl)) {
        CapacitorApp.exitApp();
        return;
      }

      //Para el resto de rutas, permite retroceder
      window.history.back();
    });
  }

  setearValueConfetti() {
    const obj = sessionStorage.getItem('confetti');
    if (obj) {
      this.confetti = JSON.parse(obj);
    } else this.confetti = false;
  }

}
