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
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';

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

  constructor(
    private router: Router,
    private location: Location,
    private messageService: MessageService,
    private getInversionService: GetInversionService,
    private dialogService: DialogService
  ){
    // recuperando objeto nueva inversion
    const obj = sessionStorage.getItem('objNuevaInv');
    if(obj) {
      this.objNuevaInv = JSON.parse(obj);
    }
  }

  ngAfterViewInit(): void{
    this.mostrarMensaje();
  }

registerInvTrue(){
  const objNuevaInv = {
    fkUsuario : this.objNuevaInv.fkUsuario,
    // objeto inversion
    monto: this.objNuevaInv.monto,
    nroCuotas: this.objNuevaInv.nroCuotas,
    interes: this.objNuevaInv.interes,
    fechaInicio: this.objNuevaInv.fechaInicio,
    fechaFin: this.objNuevaInv.fechaFin,
    //comentario
    comentario: this.objNuevaInv.comentario,
    // objeto cliente
    nombres: this.objNuevaInv.fkUsuario==null?this.objNuevaInv.nombres:null,
    apellidoPaterno: this.objNuevaInv.fkUsuario==null?this.objNuevaInv.apellidoPaterno:null,
    apellidoMaterno: this.objNuevaInv.fkUsuario==null?this.objNuevaInv.apellidoMaterno:null,
    celular: this.objNuevaInv.fkUsuario==null?this.objNuevaInv.celular:null,
    direccion: this.objNuevaInv.fkUsuario==null?this.objNuevaInv.direccion:null,
    // validate
    validado: true
  }
  this.serviceTrueRegisterInversion(objNuevaInv);
    
}

serviceTrueRegisterInversion(requestBody: any){
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

}
