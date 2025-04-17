import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Location } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { catchError, delay, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
  selector: 'app-confirm-inversion',
  standalone: true,
  imports: [InputTextareaModule,FloatLabelModule,InputTextModule,FormsModule,CommonModule,ButtonModule,
    ToastModule,LoadingComponent],
  templateUrl: './confirm-inversion.component.html',
  styleUrl: './confirm-inversion.component.scss'
})
export default class ConfirmInversionComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  objNuevaInv: any = {};
  fechasInv: any = {};

  // response validado, servicio anterior
  response: any = {
    idUsuario: null,
    monto: 5000.0,
    interes: 20.0,
    comentario: "",
    nroCuotas: 24,
    valorCuota: 250.0,
    fechaInicio: "",
    fechaFin: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    celular: "",
    direccion: "",
  }
  persona: any = {}
  

  constructor(
    private router: Router,
    private messageService: MessageService,
    private getInversionService: GetInversionService,
    private dialogService: DialogService,
    private tempDataService: TempDataService,
  ){
    // recuperando objeto nueva inversion
    /* const obj = sessionStorage.getItem('objNuevaInv');
    const fechas = sessionStorage.getItem('fechasInv');
    if(obj && fechas) {
      this.objNuevaInv = JSON.parse(obj);
      this.fechasInv = JSON.parse(fechas);
    }  */
  }

  ngOnInit(): void{
    if(this.tempDataService.hasItem('objInversion') && this.tempDataService.hasItem('persona')) { /* && this.tempDataService.hasItem('response') */
      this.objNuevaInv = this.tempDataService.getItem<any>('objInversion');
      this.persona = this.tempDataService.getItem<any>('persona');
      
      setTimeout(() => {
        this.generateRequestService(false);
      }, 100); 
    } else{
      setTimeout(() => {
        this.showInvPrest("Será redirigido a la vista de Datos de la inversión.","Faltan datos de la inversión");
      }, 100); 
    }
    
  }

  ngAfterViewInit(): void{
    this.mostrarMensaje();
  }

  showInvPrest(message: string, header: string) {
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
        this.router.navigate(['registrar/datosinversion']);
      }
    });
}

generateRequestService(isValidado: boolean){
  let requestBody = {
    fkUsuario: this.persona.idUsuario?this.persona.idUsuario:null,
    // objeto inversion
    monto: this.objNuevaInv.monto,
    nroCuotas: this.objNuevaInv.nroCuotas,
    interes: this.objNuevaInv.interes,
    //comentario
    comentario: this.objNuevaInv.comentario,
    // objeto cliente
    nombres: this.persona.idUsuario?null:this.persona.nombres,
    apellidoPaterno: this.persona.idUsuario?null:this.persona.apellidoPaterno,
    apellidoMaterno: this.persona.idUsuario?null:this.persona.apellidoMaterno,
    celular: this.persona.idUsuario?null:this.persona.celular.replace(/ /g, ""),
    direccion: this.persona.idUsuario?null:this.persona.direccion,
    fechaInicio: this.objNuevaInv.fechaInicio,
    fechaFin: this.objNuevaInv.fechaFin,
    // validate
    validado: isValidado
  }
  
  this.serviceRegisterInversion(requestBody);
    
}

/* serviceFalseRegisterInversion(requestBody: any){
  this.loadingComponent.show();
  this.getInversionService.registerInversion(requestBody).pipe(
    finalize(() => this.loadingComponent.hide()),
    catchError((error) => {
      if (error.status === 400) {
        this.show(error.error.descripcion, Constantes.MSG_H_400); // Mensaje para 400
      } else {
        this.show(Constantes.MSG_500, Constantes.MSG_H_500); // Mensaje para otros errores
      }
      // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
      return of(null);
    })
  ).subscribe((resp: any) => {
    if (resp) {
      const messageData = {
        severity: 'success',
        summary: '¡DATOS VALIDADOS!',
        detail: resp.descripcion,
        life: 3000
      };
      const fechas = {
        fechaInicio: this.objInversion.fechaInicio,
        fechaFin: this.objInversion.fechaFin
      }

      sessionStorage.setItem('fechasInv', JSON.stringify(fechas));
      sessionStorage.setItem('objNuevaInv',JSON.stringify(resp.data));
      sessionStorage.setItem('lastMessage', JSON.stringify(messageData));
      this.router.navigate(['registrar/confirmar']);
    }
  });
}
 */

serviceRegisterInversion(requestBody: any){
  this.loadingComponent.show();
  this.getInversionService.registerInversion(requestBody).pipe(
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
      this.router.navigate(['registrar/inversiondetalle'], {queryParams:{"idInversion":resp.data}})
    }else if (resp.codigo === Constantes.CODIGO_STATUS_202) {
      this.response = resp.data;
      const messageData = {
        severity: 'success',
        summary: '¡DATOS VALIDADOS!',
        detail: resp.descripcion,
        life: 3000
      };
      
      this.messageService.add(messageData);
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
        this.router.navigate(['/inicio']);
      }
    });
}

formatNumberEspaciado(numero: string): string {
  return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

}
