import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { TempDataService } from '../../../core/services/temp-data.service';
import { Constantes } from '../../../core/constant/Constantes';
import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { IonApp, IonRouterOutlet, NavController } from '@ionic/angular';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/** Pantallas sin sesión: no muestran header. */
const FLOW_OUT_SESSION = [
  '/login', '/registrar', '/registrar/personal', '/login-user', '/membresia-exp', '/mantenimiento'
];

/** Pantallas raíz (con barra de pestañas): el header no muestra "volver". */
const SHOW_MENU = [
  '/inicio', '/reporte/pagos-pendientes', '/vehicular/inicio', '/clientes',
  '/inv/configuracion', '/adm/configuracion', '/perfil', '/rentabilidad',
  '/whatsapp', '/configuracion-cliente'
];

const SIN_INICIO = [
  '/registrar/inversiondetalle', '/vehicular/registro/inversiondetalle'
];

/** Donde el botón atrás está bloqueado (app.component): tampoco se permite el gesto de deslizar. */
const SIN_SWIPE = [
  '/vehicular/inicio', '/reporte/pagos-pendientes', ...SIN_INICIO, '/mantenimiento'
];

/**
 * Shell de la app: <ion-app> + header + <ion-router-outlet> (transiciones nativas iOS/Android).
 * El menú lateral (drawer) se reemplazó por la barra de pestañas (pages/nav/tabs).
 */
@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, ToastModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.scss',
})
export class NavegationComponent {

  showVolverButton: boolean = true;

  irInicio: boolean = false;

  session: boolean = false;
  outSession: boolean = false;
  confetti: boolean = false;

  /** Gesto de deslizar para volver (iOS). Se apaga donde el botón atrás está bloqueado. */
  swipeHabilitado: boolean = true;

  /* Vehicular */
  registerVeh: boolean = false;

  private routerSubscription!: Subscription;

  pathLogo: string | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private tempDataService: TempDataService,
    private messageService: MessageService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    let urlActual = '';

    // Suscribirse a los eventos de navegación para detectar cambios de ruta
    this.routerSubscription = this.router.events.subscribe((event) => {
      /* Definir el perfil de usuario */
      const decodedToken = this.loginService.getDecodedToken();

      if (decodedToken) {
        const codPerfil = decodedToken.codPerfil;
        this.tempDataService.setConstant("codPerfil", codPerfil);
        const permisos = decodedToken.permisos ?? [];
        this.tempDataService.setConstant('permisos', permisos);
      }
      //Definir valor de confetti
      this.setValueConfetti();

      if (event instanceof NavigationStart) {
        // Entrar o salir de la sesión (login -> inicio, cerrar sesión, sesión expirada) reinicia la
        // pila de Ionic: así "atrás" o el gesto de deslizar no regresan a la otra zona de la app.
        const destino = event.url.split('?')[0];
        if (urlActual && FLOW_OUT_SESSION.includes(urlActual) !== FLOW_OUT_SESSION.includes(destino)) {
          this.navCtrl.setDirection('root', true, 'forward');
        }
      }

      if (event instanceof NavigationEnd) {
        const currentRoute = event.urlAfterRedirects.split('?')[0]; // Para ignorar parámetros de query
        urlActual = currentRoute;
        // Controlar la visibilidad del botón "Volver" en función de la ruta actual
        if (SHOW_MENU.includes(currentRoute)) {
          this.showVolverButton = false;
        } else if (SIN_INICIO.includes(currentRoute)) {
          this.showVolverButton = !this.confetti;
        } else {
          this.showVolverButton = true;
          this.irInicio = false;
        }

        this.swipeHabilitado = !SIN_SWIPE.includes(currentRoute) && !this.confetti;

        //CONTROLAR VISIBILIDAD DEL HEADER
        this.session = this.loginService.getToken() != null;
        this.outSession = FLOW_OUT_SESSION.includes(currentRoute);
      }

      /* Cargar Logo y Sello */
      const logoGuardado = sessionStorage.getItem('pathLogo');
      this.pathLogo = logoGuardado && logoGuardado !== 'null' ? logoGuardado : 'public/logos/logo_ssimple.png';

      /* Mostrar mensajes */
      this.showMessageInfo();
    });

    //Definir de donde vengo
    this.definirFrom();
  }

  showMessageInfo() {
    /* Mostrar msg inversion eliminada */
    if (this.tempDataService.hasItem('delete_inversion')) {
      const messageData = {
        severity: 'success',
        summary: '!INVERSIÓN ELIMINADA¡',
        detail: 'Se eliminó correctamente.',
        life: 3000
      };

      this.messageService.add(messageData);
      this.tempDataService.removeItem('delete_inversion');
    }
  }

  setValueConfetti() {
    const obj = sessionStorage.getItem('confetti');
    if (obj) {
      this.confetti = JSON.parse(obj);
    } else this.confetti = false;
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  volver() {
    if (this.irInicio || (!this.fromList && this.fromList != null)) {
      if (this.registerVeh) this.router.navigate(['/vehicular/inicio']);
      else this.router.navigate(['/inicio']);
    }
    else this.location.back();
  }

  fromList: boolean | null = null;
  definirFrom() {
    // Recuperar el parámetro de consulta `from`
    this.route.queryParamMap.subscribe(params => {
      const fromView = params.get('from');
      if (fromView == 'list') this.fromList = true;
      else if (fromView == 'register') {
        if (this.confetti) this.fromList = false;
        else this.fromList = true;
      } else if (fromView == 'registerVeh') {
        this.fromList = false;
        this.registerVeh = true;
      }
      else this.fromList = null;
    });
  }

}
