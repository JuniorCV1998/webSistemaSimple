import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoloLetrasDirective } from '../../../components/directives/solo-letras.directive';
import { CelularPaisComponent } from '../../../components/resources/celular-pais/celular-pais.component';
import { COD_PAIS_PERU, celularLimpio, celularParaMostrar, celularValido, etiquetaDocumento, sinAutocompletado } from '../../../core/utils/documento-pais';
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
import { NavController } from '@ionic/angular';
import { transicionFade } from '../../../core/ionic/transiciones';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SystemService } from '../../../core/services/system/system.service';
import { AJUSTES_ACTUALES } from '../../../core/utils/membresia';

@Component({
  selector: 'app-register-personal',
  standalone: true,
  imports: [ButtonModule, InputTextModule, CheckboxModule, PasswordModule,
    CommonModule, InputOtpModule, FormsModule, CelularPaisComponent, SoloLetrasDirective,
    CardModule, BreadcrumbModule, LoadingComponent, ConfirmDialogModule, DialogModule],
  providers: [ConfirmationService],
  templateUrl: './register-personal.component.html',
  styleUrl: './register-personal.component.scss'
})
export default class RegisterPersonalComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  codRegisterValidate: number | null = null;
  correo: string = '';

  confirmCase: boolean = true;
  // Términos y Política de Privacidad
  checked: boolean = false;
  visible: boolean = false;
  /** Correo de contacto: el configurado por el admin en "Ajustes del sistema" (con respaldo local). */
  userEmail = AJUSTES_ACTUALES.contacto.correo;

  aceptarTerminos(): void {
    this.checked = true;
    this.visible = false;
  }

  objPersona: any = {
    codTipoDoc: "",
    nroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    codPais: COD_PAIS_PERU,
    celular: "",
    direccion: ""
  }

  objPersonaJuridica: any = {
    codTipoDoc: "",
    nroDocumento: "",
    razonSocial: "",
    nombreComercial: "",
    codPais: COD_PAIS_PERU,
    celular: "",
    direccion: ""
  }

  isClienteNatural: Boolean = true;
  nombresEditables = false;

  get personaActual(): any {
    return this.isClienteNatural ? this.objPersona : this.objPersonaJuridica;
  }

  get etiquetaDoc(): string {
    return etiquetaDocumento(this.personaActual.codTipoDoc);
  }

  get celularMostrar(): string {
    return celularParaMostrar(this.personaActual.celular, this.personaActual.codPais, true);
  }

  pathSello: string | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private dialogService: DialogService,
    private registerService: RegisterService,
    private confirmationService: ConfirmationService,
    private navCtrl: NavController,
    systemService: SystemService
  ) {
    systemService.ajustesPublicos().subscribe(a => { if (a.contacto?.correo) this.userEmail = a.contacto.correo; });
    // recuperando el codigo de registro
    const obj = sessionStorage.getItem('objUser');
    const cliente = sessionStorage.getItem('dataCliente');
    if (obj && cliente) {
      const reqObj = JSON.parse(obj);
      this.codRegisterValidate = reqObj.codRegisterValidate;
      this.correo = reqObj.correo;
      const reqCliente = JSON.parse(cliente);
      if (reqCliente.codTipoDoc == '06') {
        this.objPersonaJuridica.codTipoDoc = reqCliente.codTipoDoc;
        this.objPersonaJuridica.razonSocial = reqCliente.razonSocial;
        this.objPersonaJuridica.direccion = reqCliente.direccion;
        this.objPersonaJuridica.nroDocumento = reqCliente.nroDocumento;
        this.isClienteNatural = false;
      } else if (reqCliente.codTipoDoc) {
        // DNI (01), carné de extranjería (04) y pasaporte (07)
        this.objPersona.codTipoDoc = reqCliente.codTipoDoc;
        this.objPersona.nombres = reqCliente.nombres || '';
        this.objPersona.apellidoPaterno = reqCliente.apellidoPaterno || '';
        this.objPersona.apellidoMaterno = reqCliente.apellidoMaterno || '';
        this.objPersona.nroDocumento = reqCliente.nroDocumento;
        // C.E./pasaporte no se autocompletan (RENIEC no los cubre): el usuario escribe su nombre
        this.nombresEditables = sinAutocompletado(reqCliente.codTipoDoc) || !this.objPersona.nombres;
      }
    }
  }

  ngOnInit(): void {
    sessionStorage.removeItem('token');

    /* Cargar Logo y Sello */
    const selloGuardado = sessionStorage.getItem('pathSello');
    this.pathSello = selloGuardado && selloGuardado !== 'null' ? selloGuardado : 'public/logos/sello_ssimple.png';

  }

  volver() {
    this.location.back();
  }

  registrarInversor() {
    this.confirm(Constantes.CD_HEADER_MSG_CONF, Constantes.CD_BODY_MSG_CONF).then((result) => {
      if (result) {
        // Copia para no dejar el celular sin espacios en el formulario si el registro falla
        const persona = { ...this.personaActual };
        persona.celular = celularLimpio(persona.celular);
        persona.codPais = persona.codPais || COD_PAIS_PERU;
        if (this.isClienteNatural) {
          persona.nombres = persona.nombres.trim();
          persona.apellidoPaterno = persona.apellidoPaterno.trim();
          persona.apellidoMaterno = persona.apellidoMaterno.trim();
        }
        let reqBody = {
          codRegisterValidate: this.codRegisterValidate,
          persona
        };

        this.loadingComponent.show();
        this.registerService.confirmRegister(reqBody).pipe(
          finalize(() => this.loadingComponent.hide()),
          catchError((error) => {
            if (error.status === 422) {
              if (error.error.descripcion != undefined) this.show(error.error.descripcion, Constantes.MSG_H_400, false);
              else this.show(error.error.message, Constantes.MSG_H_400, true);
            } else {
              this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
            }
            return of(null);
          })
        ).subscribe((resp: any) => {
          if (resp?.codigoMessage == Constantes.STATUS_SUCCESS_RI && resp.totalRecord == 1) {
            sessionStorage.setItem('emailCreate', resp.data);
            this.confirmCase = false;
            this.confirm("¡Bienvenido!", Constantes.CD_BODY_MSG_BNV).then(() => {
              // El diálogo vive en <body>: se cierra explícitamente y se navega como raíz para que
              // Ionic descarte las pantallas del registro (si no, el popup quedaba flotando encima).
              this.confirmationService.close();
              this.navCtrl.navigateRoot('/login', { animation: transicionFade });
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
          key: 'cd',
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
        if (irInicio) this.router.navigate(['/login']);
      }
    });
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    if (this.isClienteNatural) {
      // Validación para persona natural
      return (
        this.objPersona.nombres.trim() !== '' &&
        this.objPersona.apellidoPaterno.trim() !== '' &&
        this.objPersona.apellidoMaterno.trim() !== '' &&
        celularValido(this.objPersona.celular, this.objPersona.codPais) &&
        this.objPersona.direccion.trim() !== '' &&
        this.checked !== false
      );
    } else {
      // Validación para persona jurídica
      return (
        this.objPersonaJuridica.razonSocial.trim() !== '' &&
        celularValido(this.objPersonaJuridica.celular, this.objPersonaJuridica.codPais) &&
        this.objPersonaJuridica.direccion.trim() !== '' &&
        this.checked !== false
      );
    }
  }


  showDialog() {
    this.visible = true;
  }

  /* formatCelular(input: string): string {
    const value = input.replace(' ','');
    return value.replace(/[^0-9]/g, ''); // Eliminar cualquier carácter no numérico
  } */


}