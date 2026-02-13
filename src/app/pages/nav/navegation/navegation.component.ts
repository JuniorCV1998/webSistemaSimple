import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { slideInAnimation } from '../animation/slideInAnimation ';
import { TempDataService } from '../../../core/services/temp-data.service';
import { Constantes } from '../../../core/constant/Constantes';
import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SidebarModule, Sidebar } from 'primeng/sidebar';
import { StyleClassModule } from 'primeng/styleclass';
import { TabMenuModule } from 'primeng/tabmenu';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarModule, ButtonModule, RippleModule, StyleClassModule,
    AvatarModule, TabMenuModule, RouterModule, DrawerModule,ToastModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.scss',
  animations: [slideInAnimation]
})
export class NavegationComponent {

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData?.['animation'];
  }

  @ViewChild('drawerRef') drawerRef!: Drawer;

  showVolverButton: boolean = true;
  showIconHome: boolean = false;
  showAux: boolean = false;

  irInicio: boolean = false;

  session: boolean = false;
  outSession: boolean = false;
  confetti: boolean = false;

  /* Vehicular */
  registerVeh: boolean = false;

  private routerSubscription!: Subscription;

  /* Datos del usuario */
  codPefil: any = null;

  /* Permisos del usuario */
  permisos: any = null;
  permisoVehicular: boolean = false; // permiso vehicular

  pathLogo: string | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private tempDataService: TempDataService,
    private messageService: MessageService,
  ) {
    /* const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      console.log('Nombre:', decodedToken.nombre);
      console.log('Código Único:', decodedToken.codigoUnico);
      console.log('codPerfil:', decodedToken.codPerfil);
      console.log('Correo:', decodedToken.usuario);
      console.log('inversor',decodedToken.inversor);
      console.log('idUsuario:', decodedToken.idUsuario);
      console.log('permisos:', decodedToken.permisos);
    } */
  }

  ngOnInit() {
    /* Muestra las barras de Menu */
    const showMenu = [
      '/inicio', '/reporte/pagos-pendientes', '/vehicular/inicio', '/clientes',
      '/inv/configuracion', '/adm/configuracion', '/perfil', '/reporte/rentabilidad'
    ];
    const sinInicio = [
      '/registrar/inversiondetalle', '/vehicular/registro/inversiondetalle'
    ];
    const flowOutSession = [
      '/login', '/registrar', '/registrar/personal', '/login-user', '/membresia-exp', '/mantenimiento'
    ];

    // Suscribirse a los eventos de navegación para detectar cambios de ruta
    this.routerSubscription = this.router.events.subscribe((event) => {
      /* Definir el perfil de usuario */
      const decodedToken = this.loginService.getDecodedToken();

      if (decodedToken) {
        this.codPefil = decodedToken.codPerfil;
        this.tempDataService.setConstant("codPerfil", this.codPefil);
        this.permisos = decodedToken.permisos ?? [];
        this.tempDataService.setConstant('permisos', this.permisos);
        // Validaciones de permisos
        this.permisoVehicular = this.permisos.some(
          (p: any) => p.codigo === Constantes.INV_VEHICULAR
        );

      }
      //Definir valor de confetti
      this.setValueConfetti();
      if (event instanceof NavigationEnd) {
        const currentRoute = event.url.split('?')[0]; // Para ignorar parámetros de query
        // Controlar la visibilidad del botón "Volver" en función de la ruta actual
        if (showMenu.includes(currentRoute)) {
          this.showVolverButton = false;
          this.showAux = false;
          /* this.showIconHome = true; */
        } else if (sinInicio.includes(currentRoute)) {
          if (this.confetti) this.showVolverButton = false;
          else this.showVolverButton = true;
          this.showAux = true;
        } else {
          this.showVolverButton = true;
          this.irInicio = false;
          this.showAux = false;
        }

        //CONTROLAR VISIBILIDAD DEL HEADER
        if (this.loginService.getToken() != null) {
          this.session = true;
        }
        else this.session = false;

        if (flowOutSession.includes(currentRoute)) this.outSession = true;
        else this.outSession = false;
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

  //Slider Module
  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  visible: boolean = false;
  sidebarOpened: boolean = false;

  openNav() {
    //alert("")
    this.sidebarOpened = true;
  }

  // Método para cerrar el sidebar
  /*   closeNav() {
      this.sidebarOpened = false;
    } */


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

  sessionClear() {
    const event = new Event('');
    this.closeCallback(event);
    sessionStorage.clear();
    this.router.navigate(['/login-user']);
  }

}
