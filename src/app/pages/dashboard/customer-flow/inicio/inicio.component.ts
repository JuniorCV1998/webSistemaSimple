import { Component } from '@angular/core';
import { LoginService } from '../../../../core/services/auth/login/login.service';
import { CommonModule } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { delay, finalize } from 'rxjs';
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
    this.getInversionService.getInversionesClient().pipe(delay(300),finalize(() => this.skeletonShow = false)).
    subscribe((resp: any)=> {
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI) {
        this.data = resp.data;
      }
      else {
        this.data = [];
      }
    } );
  }

  formatDate(dateString: string) {
    var fecha = dateString.split(' ');
    return fecha[0];
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

  /* data: any = [
        {
            "idInversion": 6,
            "monto": 7000,
            "interes": 25,
            "comentario": "Esta es la tercera inversion registrada",
            "nroCuotas": 24,
            "valorCuota": 60,
            "codOperacion": "000000006",
            "nroInversion": 2,
            "estadoDeuda": "C",
            "fechaInicio": "",
            "fechaFin": "",
            "fechaActualizacion": "Hoy - 08:54 a. m.",
            "ctasPagadas": 24
        },
        {
            "idInversion": 7,
            "monto": 7000,
            "interes": 25,
            "comentario": "Esta es la tercera inversion registrada",
            "nroCuotas": 24,
            "valorCuota": 60,
            "codOperacion": "000000007",
            "nroInversion": 3,
            "estadoDeuda": "P",
            "fechaInicio": "",
            "fechaFin": "",
            "fechaActualizacion": "Hoy - 08:54 a. m.",
            "ctasPagadas": 17
        },
        {
            "idInversion": 8,
            "monto": 7000,
            "interes": 25,
            "comentario": "Esta es la tercera inversion registrada",
            "nroCuotas": 24,
            "valorCuota": 60,
            "codOperacion": "000000008",
            "nroInversion": 4,
            "estadoDeuda": "P",
            "fechaInicio": "",
            "fechaFin": "",
            "fechaActualizacion": "Hoy - 08:55 a. m.",
            "ctasPagadas": 10
        },
        {
            "idInversion": 88,
            "monto": 1233,
            "interes": 20,
            "comentario": "",
            "nroCuotas": 24,
            "valorCuota": 61.65,
            "codOperacion": "000000088",
            "nroInversion": 4,
            "estadoDeuda": "P",
            "fechaInicio": "13/10/24 08:56",
            "fechaFin": "06/11/24 08:56",
            "fechaActualizacion": "Hoy - 09:01 a. m.",
            "ctasPagadas": 13
        }
    ] */
}
