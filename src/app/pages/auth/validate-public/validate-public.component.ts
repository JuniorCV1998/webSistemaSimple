import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Location } from '@angular/common';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { ClienteJuridico, ClienteNatural } from '../../../interfaces/cliente/objeto-cliente';
import { CodigoUnicoService } from '../../../core/services/codigo-unico/codigo-unico.service';
import { catchError, finalize, of, throwError } from 'rxjs';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { SoloNumerosDirective } from '../../../components/directives/solo-numeros.directive';
import { Constantes } from '../../../core/constant/Constantes';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-validate-public',
  standalone: true,
  imports: [ButtonModule, InputTextModule, CheckboxModule, PasswordModule, CommonModule, InputOtpModule, FormsModule,
    LoadingComponent, RouterModule, SelectModule, MessageModule, SoloNumerosDirective, ToastModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './validate-public.component.html',
  styleUrl: './validate-public.component.scss'
})
export default class ValidatePublicComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  /* Respuesta de servicio */
  cargando: boolean = false;
  severity: string = "warn";
  message: string = "";
  showMessage: boolean = false;
  documentoVerificado: boolean = false;
  /* resp codigo unico */
  headerMessage: string = "";
  bodyMessage: string = "";
  data: any = {};

  /* Datos cliente*/
  selectedTipoDoc: any | null;
  nroDocumento: string = "";
  correo: string = "";

  codRegisterValidate: number | null = null;

  obj: any = {
    tipoDocumento: "",
    nroDocumento: "",
    correo: ""
  }

  constructor(
    private router: Router,
    private location: Location,
    private codigoUnicoService: CodigoUnicoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  cliente: any = {};
  cliNatural: ClienteNatural = {};
  cliJuridico: ClienteJuridico = {};


  tipoDocs: any[] = [ /* Aún no existe servicio back para esta lista */
    {
      "codigo": "01",
      "descripcionAbrev": "DNI",
      "descripcion": "DOCUMENTO NACIONAL DE IDENTIDAD"
    },
    /* {
         "codigo": "04",
          "descripcionAbrev": "CARNÉ EXT.",
        "descripcion": "CARNÉ DE EXTRANJERÍA"
    }, */
    {
      "codigo": "06",
      "descripcionAbrev": "RUC",
      "descripcion": "REG. ÚNICO DE CONTRIBUYENTES (1)"
    }
  ];

  buscarCliente(tipoDocumento: string, nroDocumento: string) {
    this.cargando = true;
    this.codigoUnicoService.buscarCliente(tipoDocumento, nroDocumento).pipe(
      /* delay(3000), */
      finalize(() => this.cargando = false),
      catchError((error) => {
        this.showMessage = true;
        if (error.status === 422 || error.status === 404) {
          this.severity = 'warn';
          this.message = error.error.message;

        } else {
          this.severity = 'error';
          this.message = error.error.descripcion;
        }
        return throwError(() => error);
      })
    ).subscribe((resp: any) => {
      if (resp?.codTipoDoc === "01") {
        this.cliNatural = resp;
        this.cliente = this.cliNatural;
      } else if (resp?.codTipoDoc === "06") {
        this.cliJuridico = resp;
        this.cliente = this.cliJuridico;
      }
      this.documentoVerificado = true;

      const messageData = {
        severity: 'success',
        summary: 'Documento verificado',
        /* detail: 'Documento verificado', */
        life: 3000
      };
      this.messageService.add(messageData);
    });
  }

  validarCorreoExistente(correo: string) {
    this.cargando = true;
    this.codigoUnicoService.correoExistente(correo).pipe(
      finalize(() => this.cargando = false),
      catchError((error) => {
        this.showMessage = true;
        if (error.status === 409 || error.status === 400) {
          if (error.error.codigo === Constantes.STATUS_ERROR_RI) this.severity = 'error'
          else this.severity = 'warn';
          this.message = error.error.descripcion;

        } else {
          this.severity = 'error';
          this.message = Constantes.MSG_ERROR_SERVICIO;
        }
        return throwError(() => error);
      })
    ).subscribe((resp: any) => {
      if (resp?.codigo === Constantes.STATUS_SUCCESS_RI) {
        this.crearCodigoUnico();
      }
    });
  }

  crearCodigoUnico() {
    this.cargando = true;
    let request = {
      tipoDocumento: this.selectedTipoDoc.codigo,
      nroDocumento: this.nroDocumento,
      correo: this.correo
    }

    sessionStorage.clear();

    this.codigoUnicoService.crearCodigoUnico(request).pipe(
      finalize(() => this.cargando = false),
      catchError((error) => {

        if (error.status === 400) {
          this.showMessage = true;
          this.severity = 'warn';
          this.message = error.error.descripcion;
          return throwError(() => error);
        } else if (error.status === 409) {
          this.data = error.error;
          if (error.error.data.estado === 'A') {
            this.headerMessage = "Ya tienes una cuenta registrada";
            this.bodyMessage = "Tu usuario asociado al correo <b>" + this.data.data.descripcion + "</b> está registrado pero inactivo. Para activarlo, completa tu registro haciendo clic en el botón “Continuar”."
            sessionStorage.setItem('codUnico', error.error.data.codigo);
          }
          else if (error.error.data.estado === 'I') {
            this.headerMessage = "Ya tienes una cuenta activa";
            this.bodyMessage = "Ingresa a tu cuenta con el correo <b>" + this.data.data.descripcion + "</b> y tu contraseña.";
          }
          this.respCodigoUnico();
          return of(null);
        } else {
          this.severity = 'error';
          this.message = Constantes.MSG_ERROR_SERVICIO;
          return throwError(() => error);
        }
      })
    ).subscribe((resp: any) => {
      if (resp?.codigo === Constantes.STATUS_SUCCESS_RI) {
        this.data = resp;
        if (resp.codigo === Constantes.STATUS_SUCCESS_RI) {
          this.headerMessage = "¡Tu cuenta ha sido creada con éxito!";
          this.bodyMessage = "Hemos generado tu código único <span class='txt-green'>" + this.data.data.codigo + "</span>. Haz clic en Continuar para completar tu registro y activar tu cuenta.";
          sessionStorage.setItem('codUnico', resp.data.codigo);
          sessionStorage.setItem('correo', resp.data.descripcion);
          this.respCodigoUnico();
        }
      }

    });
  }

  respCodigoUnico() {
    this.confirmCodigoUnico().then((result) => {
      if (result) {

      }
    });
  }

  confirmCodigoUnico(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'codigo_unico',
        message: '',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }


  validarDatos() {

  }

  onTipoDocChange() {
    this.showMessage = false;
    this.nroDocumento = ""; // limpia el campo
  }

  isFormValid(): boolean {
    return (
      this.obj?.correo?.trim() !== '' &&
      this.obj?.contrasena?.trim() !== '' &&
      this.obj?.contrasena2?.trim() !== '' &&
      this.obj.trim() !== '' &&
      this.obj.length == 6 &&
      this.obj == true
    );
  }

  isDocumentoValido(): boolean {
    if (!this.selectedTipoDoc || !this.nroDocumento) {
      return false;
    }
    // Suponiendo que el tipoDoc tiene un código: "01" = DNI, "02" = RUC
    if (this.selectedTipoDoc.codigo === "01") {
      return this.nroDocumento.length === 8;
    }
    if (this.selectedTipoDoc.codigo === "06") {
      return this.nroDocumento.length === 11;
    }

    return false;
  }

  isCorreoValido(): boolean {
    if (!this.correo) {
      return false;
    }

    // Expresión regular sencilla para validar correos
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    return regex.test(this.correo);
  }

  volver() {
    this.location.back();
  }

  atras() {
    this.documentoVerificado = !this.documentoVerificado;
    this.showMessage = false;
    this.message = '';
  }

}
