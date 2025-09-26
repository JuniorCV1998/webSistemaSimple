import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NroCelularDirective } from '../../../components/directives/nro-celular.directive';
import { SoloLetrasDirective } from '../../../components/directives/solo-letras.directive';
import { Location } from '@angular/common';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';
import { RegisterService } from '../../../core/services/auth/register/register.service';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-register-personal',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,
    CommonModule,InputOtpModule,FormsModule,NroCelularDirective,SoloLetrasDirective,
    CardModule,BreadcrumbModule,LoadingComponent,ConfirmDialogModule,DialogModule],
  providers: [ConfirmationService],
  templateUrl: './register-personal.component.html',
  styleUrl: './register-personal.component.scss'
})
export default class RegisterPersonalComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  codRegisterValidate: number | null = null;
  correo: string = '';

  confirmCase: boolean = true;
  // Política de Privacidad
  checked: boolean = false;
  visible: boolean = false;
  userEmail = 'generalservicesjyr@gmail.com';

  objPersona: any = {
    codTipoDoc: "",
    nroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    celular: "",
    direccion: ""
  }

  objPersonaJuridica: any = {
    codTipoDoc: "",
    nroDocumento: "",
    razonSocial: "",
    nombreComercial: "",
    celular: "",
    direccion: ""
  }

  isClienteNatural: Boolean = true;
  
  constructor(
    private router: Router,
    private location: Location,
    private dialogService: DialogService,
    private registerService: RegisterService,
    private confirmationService: ConfirmationService
  ) {
    // recuperando el codigo de registro
    const obj = sessionStorage.getItem('objUser');
    const cliente = sessionStorage.getItem('dataCliente');
    if(obj && cliente) {
      const reqObj = JSON.parse(obj);
      this.codRegisterValidate = reqObj.codRegisterValidate;
      this.correo = reqObj.correo;
      const reqCliente = JSON.parse(cliente);
      if(reqCliente.codTipoDoc=='01') {
        this.objPersona.codTipoDoc = reqCliente.codTipoDoc;
        this.objPersona.nombres = reqCliente.nombres;
        this.objPersona.apellidoPaterno = reqCliente.apellidoPaterno;
        this.objPersona.apellidoMaterno = reqCliente.apellidoMaterno;
        this.objPersona.nroDocumento = reqCliente.nroDocumento;
      } else if(reqCliente.codTipoDoc=='06'){
        this.objPersonaJuridica.codTipoDoc = reqCliente.codTipoDoc;
        this.objPersonaJuridica.razonSocial = reqCliente.razonSocial;
        this.objPersonaJuridica.direccion = reqCliente.direccion;
        this.objPersonaJuridica.nroDocumento = reqCliente.nroDocumento;
        this.isClienteNatural = false;
      }
    }
  }
  
  ngOnInit(): void{
    sessionStorage.removeItem('token');
  }

  volver() {
      this.location.back();
  }

  registrarInversor(){
    this.confirm(Constantes.CD_HEADER_MSG_CONF, Constantes.CD_BODY_MSG_CONF).then((result) => {
      if (result) {
        const nroCelular = this.objPersona.celular.replace(/\s+/g, '');
        let reqBody = {
          codRegisterValidate: this.codRegisterValidate,
          persona: this.objPersona
        };
        reqBody.persona.celular = nroCelular;
  
        this.loadingComponent.show();
        this.registerService.confirmRegister(reqBody).pipe(
          finalize(() => this.loadingComponent.hide()),
          catchError((error) => {
            if (error.status === 422) {
              if(error.error.descripcion!=undefined) this.show(error.error.descripcion, Constantes.MSG_H_400, false);
              else this.show(error.error.message, Constantes.MSG_H_400, true);
            } else {
              this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
            }
            return of(null);
          })
        ).subscribe((resp: any) => {
          if (resp?.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord == 1) {
            sessionStorage.setItem('emailCreate',resp.data);
            this.confirmCase = false;
            this.confirm(resp.message, Constantes.CD_BODY_MSG_BNV).then((result) => {
                this.router.navigate(['login']);
            });
          } else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true);
        });
      }
    });
  }

  confirm(header: string, body: string): Promise<boolean> {
    return new Promise((resolve) => {
        this.loadingComponent.show();
      setTimeout(() => {
        this.loadingComponent.hide();
        this.confirmationService.confirm({
            header: header,
            message: body,
            accept: () => {
                resolve(true);  // Resuelve la promesa con "true" si acepta
            },
            reject: () => {
                resolve(false); // Resuelve la promesa con "false" si rechaza
            }
        });
      }, 1000);
    });
}

  show(message: string, header: string, irInicio: boolean) {
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
        if(irInicio) this.router.navigate(['/login']);
      }
    });
}

    // Método para verificar si todos los campos obligatorios están llenos
    isFormValid(): boolean {
      console.log("persona: " + JSON.stringify(this.objPersona));
      return (
        this.objPersona.nombres.trim() !== '' &&
        this.objPersona.apellidoPaterno.trim() !== '' &&
        this.objPersona.apellidoMaterno.trim() !== '' &&
        this.objPersona.celular.trim() !== '' &&
        this.objPersona.celular.length === 11 &&
        this.objPersona.direccion.trim() !== '' &&
        this.checked != false
      );
  }

  showDialog() {
      this.visible = true;
  }

/* formatCelular(input: string): string {
  const value = input.replace(' ','');
  return value.replace(/[^0-9]/g, ''); // Eliminar cualquier carácter no numérico
} */


}