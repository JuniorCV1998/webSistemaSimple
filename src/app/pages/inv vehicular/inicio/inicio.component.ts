import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of } from 'rxjs';
import { InversionVehService } from '../../../core/services/inversion-veh/inversion-veh.service';
import { TempDataService } from '../../../core/services/temp-data.service';
import { FormatNumberPipe } from '../../../core/pipes/format-number.pipe';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule,SkeletonModule,TabMenuModule,ToastModule,RouterModule,FormatNumberPipe],
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

  /* Datos del usuario */
  perfil: string = '';

  currency: string | null = null;

  constructor(
    private inversionVehService: InversionVehService,
    private router: Router,
    private tempDataService: TempDataService,
    private messageService: MessageService,
  ){
    //const perfil = this.tempDataService.getItem('codPerfil');
    if(this.tempDataService.hasConstant("codPerfil")) this.perfil = this.tempDataService.getConstant("codPerfil") ?? '';
  }

  ngOnInit(): void{
    const toastTemp = this.tempDataService.hasItem('toastTemp');
    if (toastTemp) {
      const toast = this.tempDataService.getItem<any>('toastTemp');
      setTimeout(() => {
        this.messageService.add(toast);
      }, 100); 
    }
    this.getInversionesVehiculares();

    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }
  
  ngAfterViewInit(): void {
    
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
        if(resp==null) this.listInvVehiculares = [];
        else this.listInvVehiculares = resp.data;
      }
    
    );}

    selectClient(){
      this.tempDataService.setItem('flow','vehicular');
      this.router.navigate(['registro/datoscliente']);
    }

}
