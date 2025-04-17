import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InversionVehService } from '../../../core/services/inversion-veh/inversion-veh.service';
import { catchError, delay, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { SkeletonModule } from 'primeng/skeleton';
import { Router } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';
import { TempDataService } from '../../../core/services/temp-data.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule,SkeletonModule,TabMenuModule,ToastModule],
  providers: [MessageService],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export default class InicioComponent {

  pendiente: boolean = true;
  isLoading: boolean = false;
  forSkeleton: number = 5;

  listInvVehiculares: any = [];

  toast: any = null;

  constructor(
    private inversionVehService: InversionVehService,
    private router: Router,
    private tempDataService: TempDataService,
    private messageService: MessageService,
  ){}

  ngOnInit(): void{
    const toastTemp = this.tempDataService.hasItem('toastTemp');
    if (toastTemp) {
      const toast = this.tempDataService.getItem<any>('toastTemp');
      setTimeout(() => {
        this.messageService.add(toast);
      }, 100); 
    }
  }
  
  ngAfterViewInit(): void {
    this.getInversionesVehiculares();
    this.tempDataService.clear();
  }

  changeOpen(estado: boolean){
    if(this.pendiente == estado) return;
    else{
      this.pendiente = estado;
      this.getInversionesVehiculares();
    }
  }


    getInversionesVehiculares(){
      /* this.loadingComponent.show(); */
      this.isLoading = true;
      const status = this.pendiente?"P":"C";
      this.inversionVehService.getInversionesVehList(status).pipe(
        finalize(() => {
          //this.loadingComponent.hide();
          this.isLoading = false; // Cambia a falso cuando termine
        }),
          // Manejamos errores de respuesta HTTP con catchError
          catchError((error) => {
          // Aquí manejamos los diferentes errores HTTP (400, 403, 500, etc.)
          if (error.status === 403) {
            //this.show('Acceso denegado', Constantes.MSG_GLOBAL); // Mensaje para 403
          } else if (error.status === 500) {
            //this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para 500
          } else {
            //this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
          }
            // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
            return of(null);
          })
      ).
      subscribe((resp: any)=> { 
        if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord>=1) {
          this.listInvVehiculares = resp.data;
        }
      }
    
    );}

    selectClient(){
      this.tempDataService.setItem('flow','vehicular');
      this.router.navigate(['registro/datoscliente']);
    }

}
