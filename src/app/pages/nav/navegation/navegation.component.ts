import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { SidebarModule } from 'primeng/sidebar';
import { Sidebar } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { AvatarModule } from 'primeng/avatar';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [RouterOutlet,CommonModule,SidebarModule,ButtonModule, RippleModule, StyleClassModule,AvatarModule,TabMenuModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.scss'
})
export class NavegationComponent {

  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  showVolverButton: boolean = true;
  showIconHome: boolean = false;
  showAux: boolean = false;

  irInicio: boolean = false;

  session: boolean = false;
  outSession: boolean = false;
  confetti: boolean = false;

  private routerSubscription!: Subscription;

  /* Datos del usuario */
  codPefil: any = null;

  constructor(
    private location: Location,
    private router: Router,
    private loginService: LoginService,
    private route: ActivatedRoute
  ){
    /* if (decodedToken) {
      console.log('Nombre:', decodedToken.nombre);
      console.log('Código Único:', decodedToken.codigoUnico);
      console.log('codPerfil:', decodedToken.codPerfil);
      console.log('Correo:', decodedToken.usuario);
      console.log('inversor',decodedToken.inversor);
      console.log('idUsuario:', decodedToken.idUsuario);
    } */
  }

  ngOnInit() {
    const showMenu = [
      '/inicio', '/reporte/reporte-cobranza'
    ];
    const sinInicio = [
      '/registrar/inversiondetalle'
    ];
    const flowOutSession = [
      '/login','/registrar','/registrar/personal'
    ];

    // Suscribirse a los eventos de navegación para detectar cambios de ruta
    this.routerSubscription = this.router.events.subscribe((event) => {
      /* Definir el perfil de usuario */
      const decodedToken = this.loginService.getDecodedToken();
      if(decodedToken) this.codPefil = decodedToken.codPerfil; 
      //Definir valor de confetti
      this.setValueConfetti();
      if (event instanceof NavigationEnd) {
        const currentRoute = event.url.split('?')[0]; // Para ignorar parámetros de query
        // Controlar la visibilidad del botón "Volver" en función de la ruta actual
        if (showMenu.includes(currentRoute)) {
          this.showVolverButton = false;
          this.showAux = false;
          /* this.showIconHome = true; */
        } else if(sinInicio.includes(currentRoute)){
          if(this.confetti) this.showVolverButton = false;
          else this.showVolverButton = true;
          this.showAux = true;
        } else {
          this.showVolverButton = true;
          this.irInicio = false;
          this.showAux = false;
        }

        //CONTROLAR VISIBILIDAD DEL HEADER
        if(this.loginService.getToken()!=null) {
          this.session=true;
        }
        else this.session=false; 

        if (flowOutSession.includes(currentRoute)) this.outSession = true;
        else this.outSession = false;
      }
      

    });

    //Definir de donde vengo
    this.definirFrom();
  }

  setValueConfetti(){
    const obj = sessionStorage.getItem('confetti');
    if(obj) {
      this.confetti = JSON.parse(obj);
    }else this.confetti = false;
  }

  //Slider Module
  closeCallback(e: Event): void {
      this.sidebarRef.close(e);
  }

  sidebarVisible: boolean = false;
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
    if(this.irInicio || (!this.fromList && this.fromList != null)) {
      this.router.navigate(['/inicio']);
    }
    else this.location.back();
  }

  fromList: boolean | null = null;
  definirFrom(){
    // Recuperar el parámetro de consulta `from`
    this.route.queryParamMap.subscribe(params => {
      const fromView = params.get('from');
      if(fromView == 'list') this.fromList = true;
      else if(fromView == 'register') {
        if(this.confetti) this.fromList = false;
        else this.fromList = true;
      }
      else this.fromList = null;
    });
  }

  sessionClear(){
    const event = new Event('');
    this.closeCallback(event);
    sessionStorage.clear();
    this.router.navigate(['/login-user']);
  }

}
