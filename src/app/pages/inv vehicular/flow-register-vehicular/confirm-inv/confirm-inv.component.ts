import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { InversionVehService } from '../../../../core/services/inversion-veh/inversion-veh.service';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { ButtonModule } from 'primeng/button';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';

@Component({
  selector: 'app-confirm-inv',
  standalone: true,
  imports: [LoadingComponent, ToastModule, CommonModule, ButtonModule,FormatNumberPipe],
  templateUrl: './confirm-inv.component.html',
  styleUrl: './confirm-inv.component.scss'
})
export default class ConfirmInvComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  // request
  requestRegisterInv: any = {}

  // response validado, servicio anterior
  response: any = {
    idUsuario: null,
    montoDiario: null,
    duracionPago: null,
    frecuencia: '',
    placa: '',
    fechaInicio: '',
    fechaFin: '',
    descripcion: '',
    color1: '',
    color2: '',
    persona: {
      nombres: '',
      celular: '',
      direccion: ''
    }
  }

  constructor(
    private messageService: MessageService,
    private tempDataService: TempDataService,
    private dialogService: DialogService,
    private router: Router,
    private inversionVehService: InversionVehService

  ){}

  ngOnInit(): void{
    if(!this.tempDataService.hasItem('flow')) this.router.navigate(['inicio']);
    else {
      if(this.tempDataService.hasItem('inversionVeh') && this.tempDataService.hasItem('response')) {
        this.requestRegisterInv = this.tempDataService.getItem<any>('inversionVeh');
        this.response = this.tempDataService.getItem<any>('response');
      } else{
        setTimeout(() => {
          this.showInvVehicular("Será redirigido a la vista de Datos de la inversión.","Faltan datos de la inversión");
        }, 100); 
        
      }
    }
    
  }

  registerInvTrue(){
    this.loadingComponent.show();
    this.requestRegisterInv.validado = true;
    this.inversionVehService.registerInversionVeh(this.requestRegisterInv).pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError((error) => {
        if (error.status === 400) {
          this.show(error.error.descripcion, Constantes.MSG_H_400); // Mensaje para 400
        } else {
          this.show(Constantes.MSG_H_500, Constantes.MSG_500); // Mensaje para otros errores
        }
        // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
        return of(null);
      })
    ).subscribe((resp: any) => {
      if (resp.codigo === Constantes.STATUS_SUCCESS_RI) {
        sessionStorage.setItem('confetti',JSON.stringify(true));
        this.router.navigate(['vehicular/registro/inversiondetalle'], {queryParams:{"idInversionVeh":resp.data}})
      }
    });
  }

  show(message: string, header: string) {
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
      }
    });
}

  ngAfterViewInit(): void{
    this.mostrarMensaje();
    if(this.tempDataService.hasItem('flow')) 
     {
      if (Object.keys(this.requestRegisterInv).length === 0) this.showInvVehicular("Será redirigido a la vista de Datos de la inversión.","Faltan datos de la inversión");
    }
    
  }

  showInvVehicular(message: string, header: string) {
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
            this.router.navigate(['vehicular/registro/datosinversion']);
          }
        });
    }

  mostrarMensaje(){
    const storedMessage = sessionStorage.getItem('lastMessage');
      if(storedMessage) {
        const toast = JSON.parse(storedMessage);
        this.messageService.add({
          severity: toast.severity,
          summary: toast.summary,
          detail: toast.detail,
          life: toast.life
        });
        setTimeout(() => {
          sessionStorage.removeItem('lastMessage');
        }, 100); 
      }
    }

    formatNumberEspaciado(numero: string): string {
      return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    
}
