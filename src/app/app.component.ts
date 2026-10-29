
import { App as CapacitorApp } from '@capacitor/app';
import { NavegationComponent } from './pages/nav/navegation/navegation.component';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, take } from 'rxjs';
import { MaintenanceSocketService } from './core/services/mantenimiento/maintenance-socket.service';
import { initBarrasSistema, initTeclado, ocultarSplash } from './core/ionic/native';
import { Capacitor } from '@capacitor/core';
import { IntroAppComponent } from './components/intro-app/intro-app.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavegationComponent, IntroAppComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'WebSistemaSimple';
  confetti: boolean = false;

  /** Intro de marca: solo al abrir la app en el celular (en web, con ?intro para revisarla). */
  mostrarIntro = Capacitor.isNativePlatform() || new URLSearchParams(location.search).has('intro');
  primeraPantallaLista = false;

  constructor(
    private router: Router,
    private maintenanceSocketService: MaintenanceSocketService
  ) {
    initBarrasSistema();  }

  ngOnInit() {
    // Habilita desplazamiento automático con teclado
    initTeclado();

    // En el celular, la intro de marca reemplaza al splash nativo apenas Angular pinta
    // (launchAutoHide=false en capacitor.config.ts) y se retira cuando la primera pantalla
    // terminó de navegar. Sin intro, el splash se queda hasta ese momento.
    if (this.mostrarIntro) setTimeout(() => ocultarSplash(), 60);
    this.router.events.pipe(
      filter(ev => ev instanceof NavigationEnd),
      take(1)
    ).subscribe(() => setTimeout(() => {
      this.primeraPantallaLista = true;
      ocultarSplash();
    }, 150));
    // Respaldo: si la primera navegación falla, ni el splash ni la intro deben quedarse para siempre.
    setTimeout(() => {
      this.primeraPantallaLista = true;
      ocultarSplash();
    }, 5000);

    CapacitorApp.addListener('backButton', () => {
      const currentUrl = this.router.url.split('?')[0];

      const blockedRoutesWithConfetti = [
        '/registrar/inversiondetalle',
        '/vehicular/registro/inversiondetalle'
      ];

      const alwaysBlockedRoutes = [
        '/vehicular/inicio',
        '/reporte/pagos-pendientes'
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
