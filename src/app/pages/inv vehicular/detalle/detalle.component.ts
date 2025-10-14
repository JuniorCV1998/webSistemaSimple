
import { InversionVehService } from '../../../core/services/inversion-veh/inversion-veh.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { catchError, delay, finalize, of } from 'rxjs';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { Constantes } from '../../../core/constant/Constantes';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TempDataService } from '../../../core/services/temp-data.service';
import { FormsModule } from '@angular/forms';
import { Component, ViewChild } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TwoDigitsPipe } from '../../../core/pipes/two-digits.pipe';
import { FormatNumberPipe } from '../../../core/pipes/format-number.pipe';
import { DatePicker } from 'primeng/datepicker';
import { FormatDatePipe } from '../../../core/pipes/format-date.pipe';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule,SkeletonModule,TabMenuModule,LoadingComponent,ButtonModule,ToastModule,ConfirmDialogModule,
    CalendarModule,FormsModule,  FloatLabelModule, InputNumberModule,FormatNumberPipe, TwoDigitsPipe,DatePicker,FormatDatePipe],
  providers: [ConfirmationService, MessageService],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export default class DetalleComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  idInversionVeh: number = 0;
  invDetail: any = {}

  mostrarDetail: boolean = false;

  /* parametros agregar cuota */
  fechaPago: Date = new Date();
  montoPago: any = null;
  perfil: string = '';

  currency: string | null = null;
  
  constructor(
    private inversionVehService: InversionVehService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private viewportScroller: ViewportScroller,
    private messageService: MessageService,
    private tempDataService: TempDataService,
    private confirmationService: ConfirmationService,
  ){
    if(this.tempDataService.hasConstant("codPerfil")) this.perfil = this.tempDataService.getConstant("codPerfil") ?? '';
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }

  ngOnInit(): void{
    // Recuperar el parámetro de consulta `idInversionVeh`
    this.route.queryParamMap.subscribe(params => {
        const id = params.get('idInversionVeh');
        this.idInversionVeh = id ? +id : 0; // Convertir a número si existe
      });

    /* detall de inversion */
    setTimeout(() => {
        this.loadingComponent.show();
        this.getInversionesDetailVeh();
      });
  }

  ngAfterViewInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

    getInversionesDetailVeh(){
      this.inversionVehService.getInversionVehDetail(this.idInversionVeh===null?0:this.idInversionVeh).pipe(
        finalize(() => {
          this.loadingComponent.hide();
          this.isLoading = false; // Cambia a falso cuando termine
        }),
          // Manejamos errores de respuesta HTTP con catchError
          catchError((error) => {
          // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
          if (error.status === 400) this.show(Constantes.MSG_400, Constantes.MSG_H_400, true); // Mensaje para 400
          else if (error.status === 403) this.show(error.error.descripcion, Constantes.MSG_H_403, true);
          else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
            // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
            return of(null);
          })
      ).
      subscribe((resp: any)=> { 
        if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord==1) {
          this.invDetail = resp.data;
        }
        else if (resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord==0){
          this.show(resp.message, Constantes.MSG_SIN_REGISTROS, true);
        }
      }
    );
}

cerrarInversion(){
    this.confirmCerrarInv().then((result) => {
        if(result){
            this.loadingComponent.show();
            this.inversionVehService.closeInvVehicular(this.idInversionVeh===null?0:this.idInversionVeh).pipe(
                finalize(() => {
                this.loadingComponent.hide();
                }),
                // Manejamos errores de respuesta HTTP con catchError
                catchError((error) => {
                // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
                if (error.status === 400) this.show(Constantes.MSG_400, Constantes.MSG_H_400, true); // Mensaje para 400
                else if (error.status === 403) this.show(error.error.descripcion, Constantes.MSG_H_403, true);
                else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
                    // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
                    return of(null);
                })
            ).
            subscribe((resp: any)=> { 
                if(resp.codigo==Constantes.STATUS_SUCCESS_RI) {
                    let toasTemp = {
                        severity: 'success',
                        summary: 'Cerrar inversión',
                        detail: resp.descripcion,
                        life: 3000
                    };
                    this.tempDataService.setItem('toastTemp',toasTemp);
                    this.router.navigate(['/vehicular/inicio']);
                }
            }
            );
        }
    });
}

confirmCerrarInv(): Promise<boolean> {
    return new Promise((resolve) => {
        this.confirmationService.confirm({
            key: 'close_inv',
            header: 'Cerrar inversión',
            message: '¿Está seguro que desea cerrar esta inversión?',
            accept: () => {
                resolve(true);  // Resuelve la promesa con "true" si acepta
            },
            reject: () => {
                resolve(false); // Resuelve la promesa con "false" si rechaza
            }
        });
    });
  }

  agregarCuota(){
    this.modalCuota().then((result) => {
        if(result){
            this.confirmCuota().then((confirm) => {
                if(confirm){
                    /* Servicio de insertar pago */
                    this.insertPayService();
                } 
            });
        }
        
    });
  }

  insertPayService(){
    this.loadingComponent.show();
    this.inversionVehService.insertPayVehicular(this.idInversionVeh,this.formatearFecha(this.fechaPago),this.montoPago).pipe(
        finalize(() => {
        this.loadingComponent.hide();
        }),
        // Manejamos errores de respuesta HTTP con catchError
        catchError((error) => {
        // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
        if (error.status === 400) this.show(error.error.descripcion, Constantes.MSG_H_400, false); // Mensaje para 400
        else if (error.status === 403) this.show(error.error.descripcion, Constantes.MSG_H_403, false);
        else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
            // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
            return of(null);
        })
    ).
    subscribe((resp: any)=> { 
        if(resp.codigo==Constantes.STATUS_SUCCESS_RI) {
            let toasTemp = {
                severity: 'success',
                summary: 'Pagar cuota',
                detail: resp.descripcion,
                life: 3000
            };
            this.messageService.add(toasTemp);
            this.getInversionesDetailVeh();
        }
    }
);
  }

  modalCuota(): Promise<boolean> {
    return new Promise((resolve) => {
        this.confirmationService.confirm({
            key: 'add_cuota',
            header: 'Agregar cuota',
            //message: '¿Está seguro que desea cerrar esta inversión?',
            accept: () => {
                resolve(true);  // Resuelve la promesa con "true" si acepta
            },
            reject: () => {
                resolve(false); // Resuelve la promesa con "false" si rechaza
            }
        });
    });
  }

  confirmCuota(): Promise<boolean> {
    return new Promise((resolve) => {
        this.confirmationService.confirm({
            key: 'add_cuota_ok',
            header: 'Confirmar pago',
            //message: '¿Está seguro que desea cerrar esta inversión?',
            accept: () => {
                resolve(true);  // Resuelve la promesa con "true" si acepta
            },
            reject: () => {
                this.agregarCuota();
                //resolve(false); // Resuelve la promesa con "false" si rechaza
            }
        });
    });
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.fechaPago !== null &&
      this.montoPago !== null  && this.montoPago >= 1 && this.montoPago <= 100000 
    );
}

  show(message: string, header: string, inicio: boolean) {
    const ref = this.dialogService.open(MessagePopUpComponent, {
      data: {
        message: message
      },
      header: header,
      closable: false,
      closeOnEscape: false,
      modal: true,         
      width: '90%'
    });
    
    // Suscribirse al evento de cierre del diálogo
    ref.onClose.subscribe((result: any) => {
      if (result === 'aceptar') {
        // Navegamos a la ruta deseada al aceptar
        if(inicio) this.router.navigate(['/vehicular/inicio']);
      }
    });
}


  mostrarDetalle(i: number, o: number){ 
    if(this.invDetail.frecuencia==='SEMANAL') {
      this.invDetail.body[o].pagosAgrupados[i].mostrarDetalle = !this.invDetail.body[o].pagosAgrupados[i].mostrarDetalle;
    }
    else if(this.invDetail.frecuencia==='MENSUAL') this.invDetail.body[i].mostrarDetalle = !this.invDetail.body[i].mostrarDetalle;
  }

  // Método para formatear la fecha
private formatearFecha(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

}
