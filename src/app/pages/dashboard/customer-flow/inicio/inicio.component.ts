import { Component } from '@angular/core';
import { LoginService } from '../../../../core/services/auth/login/login.service';
import { CommonModule } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { finalize } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule,SkeletonModule,TabMenuModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioClientComponent {

  nombreUsuario = '';
  /* Skeleton */
  forSkeleton: number = 5;
  skeletonShow: boolean = true;

  data: any[] = [];

  constructor(
    private loginService: LoginService,
    private getInversionService: GetInversionService,
    private router: Router,
  ){
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      const fullName = decodedToken.nombre.split(" ");
      this.nombreUsuario = fullName[0];
    }
  }

  ngAfterViewInit() {
    this.getInversionesClient();
    this.setupClickListener();
  }

  getInversionesClient(){
    this.skeletonShow = true;
    this.getInversionService.getInversionesClient().pipe(finalize(() => this.skeletonShow = false)).
    subscribe((resp: any)=> {
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI) {
        this.data = resp.data;
      }
      else {
        this.data = [];
      }
    } );
  }

setupClickListener() {
  const iconoActualizar = document.getElementById('icono-actualizar');

  iconoActualizar?.addEventListener('click', () => {
    iconoActualizar.classList.add('girar');

    // Eliminar la clase después de la animación para permitir otro clic
    setTimeout(() => {
      iconoActualizar.classList.remove('girar');
    }, 1000); // Duración de la animación
  });
}

}
