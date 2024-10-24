import { AfterViewInit, Component, ComponentFactoryResolver, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { Constantes } from '../../../core/constant/Constantes';

@Component({
  selector: 'app-send-inicio',
  standalone: true,
  imports: [],
  templateUrl: './send-inicio.component.html',
  styleUrl: './send-inicio.component.scss'
})
export default class SendInicioComponent implements AfterViewInit {
 
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  constructor(private loginService: LoginService) {}

  ngAfterViewInit() {
    this.loadComponent();
  }

  async loadComponent() {
    const userDecode = this.loginService.getDecodedToken();

    let componentToLoad: any;

    if (userDecode.codPerfil === Constantes.PERFIL_CLI) {
      const { InicioClientComponent } = await import('../customer-flow/inicio/inicio.component');
      componentToLoad = InicioClientComponent;
    } else if (userDecode.codPerfil === Constantes.PERFIL_INV) {
      const { InicioComponent } = await import('../inicio/inicio.component');
      componentToLoad = InicioComponent;
    }

    if (componentToLoad) {
      const componentRef = this.container.createComponent(componentToLoad);
    }
  }
}
