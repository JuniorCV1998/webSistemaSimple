import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { finalize } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { LoginService } from '../../../../core/services/auth/login/login.service';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { InversionVehService } from '../../../../core/services/inversion-veh/inversion-veh.service';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule,SkeletonModule,TabMenuModule,RouterModule,FormatNumberPipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioClientComponent {

  nombreUsuario = '';
  /* Skeleton */
  forSkeleton: number = 5;
  skeletonShow: boolean = true;
  skeletonShowVehicular: boolean = true;

  data: any[] = [];
  dataVehicular: any[] = [];

  /* Permiso de financiamiento vehicular */
  permisoVehicular: boolean = false;

  currency: string | null = null;

  constructor(
    private loginService: LoginService,
    private getInversionService: GetInversionService,
    private inversionVehService: InversionVehService,
    private tempDataService: TempDataService
  ){
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      const fullName = decodedToken.nombre.split(" ");
      this.nombreUsuario = fullName[0];
      this.permisoVehicular = (decodedToken.permisos ?? []).some(
        (p: any) => p.codigo === Constantes.INV_VEHICULAR
      );
    }
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }

  ngAfterViewInit() {
    this.getInversionesClient();
    if (this.permisoVehicular) this.getInversionesVehiculares();
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

  getInversionesVehiculares(){
    this.skeletonShowVehicular = true;
    this.inversionVehService.getInversionesVehList('P').pipe(finalize(() => this.skeletonShowVehicular = false)).
    subscribe({
      next: (resp: any) => this.dataVehicular = resp?.data ?? [],
      error: () => this.dataVehicular = []
    });
  }

  refrescarTodo(){
    this.getInversionesClient();
    if (this.permisoVehicular) this.getInversionesVehiculares();
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
