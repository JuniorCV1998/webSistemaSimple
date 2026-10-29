import { Component, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { Constantes } from '../../../core/constant/Constantes';

/*
 * Pantalla de inicio ya cargada por perfil. PageHostComponent vuelve a crear esta pantalla cada vez
 * que se regresa a /inicio; si el import() se esperara de nuevo, quedaría un cuadro en blanco entre
 * destruir la vista anterior y crear la nueva (el parpadeo al volver). Con la clase en caché se crea
 * en el mismo ciclo, sin ese hueco.
 */
const inicioPorPerfil = new Map<string, Type<any>>();

@Component({
  selector: 'app-send-inicio',
  standalone: true,
  imports: [],
  templateUrl: './send-inicio.component.html',
  styleUrl: './send-inicio.component.scss'
})
export default class SendInicioComponent implements OnInit {

  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    const perfil = this.loginService.getDecodedToken()?.codPerfil;
    const enCache = inicioPorPerfil.get(perfil);
    if (enCache) this.container.createComponent(enCache);
    else this.loadComponent(perfil);
  }

  async loadComponent(perfil: string) {
    let componentToLoad: any;

    if (perfil === Constantes.PERFIL_CLI) {
      const { InicioClientComponent } = await import('../customer-flow/inicio/inicio.component');
      componentToLoad = InicioClientComponent;
    } else if (perfil === Constantes.PERFIL_INV) {
      const { InicioComponent } = await import('../inicio/inicio.component');
      componentToLoad = InicioComponent;
    } else if (perfil === Constantes.PERFIL_ADM) {
      const { InicioComponent } = await import('../admin-flow/inicio/inicio.component');
      componentToLoad = InicioComponent;
    }

    if (componentToLoad) {
      inicioPorPerfil.set(perfil, componentToLoad);
      this.container.createComponent(componentToLoad);
    }
  }
}
