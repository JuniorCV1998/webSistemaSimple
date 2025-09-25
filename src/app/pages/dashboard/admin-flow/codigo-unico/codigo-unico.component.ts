import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { Stepper, StepperModule, StepperPanel } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { catchError, finalize, of, throwError } from 'rxjs';
import { SoloNumerosDirective } from '../../../../components/directives/solo-numeros.directive';
import { Constantes } from '../../../../core/constant/Constantes';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { ClienteJuridico, ClienteNatural } from '../../../../interfaces/cliente/objeto-cliente';

@Component({
  selector: 'app-codigo-unico',
  standalone: true,
  imports: [ButtonModule, StepperModule],
  /* providers: [Stepper, StepperModule], */
  templateUrl: './codigo-unico.component.html',
  styleUrl: './codigo-unico.component.scss',
  schemas: []
  
})
export default class CodigoUnicoComponent {

  statusRegister: boolean = true;

  activeStep: number = 1;

  selectedTipoDoc: any | null;
  nroDocumento: string = "";
  correo: string = "";
  nroPantalla: number = 1;

  cargando: boolean = false;
  severity: string = "warn";
  message: string = "";
  showMessage: boolean = false;

  cliente: any = {};
  cliNatural: ClienteNatural={};
  cliJuridico: ClienteJuridico={};

  headerMessage: string = "";
  bodyMessage: string = "";
  data: any = {};

  /* Pantalla completa imagen */
  lightboxImage: string | null = null;
    openLightbox(img: string) {
        this.lightboxImage = img;
    }
    closeLightbox() {
        this.lightboxImage = null;
    }

  constructor(
    private adminService: AdminService
  ){}

    ngOnInit() {
        
    }


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

    
    buscarCliente(tipoDocumento: string, nroDocumento: string, activateCallback: Function){
        this.cargando = true;
        this.adminService.buscarCliente(tipoDocumento, nroDocumento).pipe(
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
                if(resp?.codTipoDoc==="01"){
                    this.cliNatural = resp;
                    this.cliente = this.cliNatural;
                } else if(resp?.codTipoDoc==="06"){
                    this.cliJuridico = resp;
                    this.cliente = this.cliJuridico;
                }
                activateCallback(2);
            });
    }

    validarCorreoExistente(correo: string, activateCallback: Function){
        this.cargando = true;
        this.adminService.correoExistente(correo).pipe(
            finalize(() => this.cargando = false),
            catchError((error) => {
                this.showMessage = true;
                if (error.status === 409 || error.status === 400) {
                    if(error.error.codigo===Constantes.STATUS_ERROR_RI) this.severity = 'error'
                    else this.severity = 'warn';
                    this.message = error.error.descripcion;

                } else {
                    this.severity = 'error';
                    this.message = Constantes.MSG_ERROR_SERVICIO;
                }
                 return throwError(() => error);
            })
            ).subscribe((resp: any) => {
                if(resp?.codigo===Constantes.STATUS_SUCCESS_RI) {
                    this.crearCodigoUnico(activateCallback);
                }
            });
    }

    crearCodigoUnico(activateCallback: Function){
        this.cargando = true;
        let request = {
            tipoDocumento: this.selectedTipoDoc.codigo,
            nroDocumento: this.nroDocumento,
            correo: this.correo
        }

        this.adminService.crearCodigoUnico(request).pipe(
            finalize(() => this.cargando = false),
            catchError((error) => {
                this.showMessage = true;
                if (error.status === 400) {
                    this.severity = 'warn';
                    this.message = error.error.descripcion;
                    return throwError(() => error);
                } else if (error.status === 409){
                    this.data = error.error;
                    if(error.error.data.estado === 'A') {
                        this.headerMessage = "Ya tienes una cuenta registrada";
                        this.bodyMessage = "Tu correo <b>"+this.data.data.descripcion+"</b> está registrado pero inactivo. Para activarla, sigue los pasos que se muestran a continuación."
                        activateCallback(3);
                    }
                    else if(error.error.data.estado === 'I') {
                        this.headerMessage = "Ya tienes una cuenta activa";
                        this.bodyMessage = "Inicia sesión con tu correo <b>"+this.data.data.descripcion+"</b> y tu contraseña. Descarga la app y accede directamente a tu cuenta.";
                        activateCallback(3);
                    }
                    return of(null);
                } else {
                    this.severity = 'error';
                    this.message = Constantes.MSG_ERROR_SERVICIO;
                    return throwError(() => error);
                }
            })
            ).subscribe((resp: any) => {
                if(resp?.codigo===Constantes.STATUS_SUCCESS_RI){
                    this.data = resp;
                    if(resp.codigo === Constantes.STATUS_SUCCESS_RI) {
                        this.headerMessage = "¡Tu cuenta ha sido creada con éxito!";
                        this.bodyMessage = "Hemos generado tu código único <b>"+this.data.data.codigo+"</b>. Ahora sigue los pasos a continuación para completar tu registro."
                        activateCallback(3);
                    }
                }
                
            });
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

    onTipoDocChange() {
        this.showMessage = false;
        this.nroDocumento = ""; // limpia el campo
    }

    onBack(activateCallback: Function, num: number) {
        this.showMessage = false;
        activateCallback(num);
    }
    
    updatePantalla(n: number){
        this.nroPantalla = n;
    }

}
