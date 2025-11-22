import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { catchError, delay, finalize, of, throwError } from 'rxjs';
import { SoloNumerosDirective } from '../../../../components/directives/solo-numeros.directive';
import { Constantes } from '../../../../core/constant/Constantes';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { ClienteJuridico, ClienteNatural } from '../../../../interfaces/cliente/objeto-cliente';
import { SelectModule } from 'primeng/select';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageService } from 'primeng/api';
import { SystemService } from '../../../../core/services/system/system.service';


@Component({
    selector: 'app-codigo-unico',
    standalone: true,
    imports: [StepperModule,
        ButtonModule, InputTextModule, ToggleButtonModule, PasswordModule, CommonModule, FormsModule, SelectModule,
        MessageModule, SoloNumerosDirective],
    /* providers: [Stepper, StepperModule], */
    templateUrl: './codigo-unico.component.html',
    styleUrl: './codigo-unico.component.scss',
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export default class CodigoUnicoComponent {

    activeStep: number = 1;

    selectedTipoDoc: any = {};

    nroDocumento: string = "";
    correo: string = "";
    nroPantalla: number = 1;

    cargando: boolean = false;
    severity: string = "warn";
    message: string = "";
    showMessage: boolean = false;

    // request cliente
    cliNatural: ClienteNatural = {};
    cliJuridico: ClienteJuridico = {};
    // cliente encontrado
    cliente: any = {};

    /* Reniec / Sunat */
    reniecSunat: boolean = false;

    headerMessage: string = "";
    bodyMessage: string = "";
    data: any = {};

    /* Link Play Store */
    urlPlayStore: string = '';

    constructor(
        private adminService: AdminService,
        private messageService: MessageService,
        private systemService: SystemService
    ) { }

    ngOnInit() {
        this.consultarURLPlayStore();
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

    consultarURLPlayStore() {
        this.systemService.urlStore().subscribe({
            next: (response: any) => {
                this.urlPlayStore = response[0].descripcion;
            },
            error: err => {
                this.urlPlayStore = 'https://play.google.com/store/apps/details?id=com.ssimple.app';
            }
        });
    }

    buscarCliente(tipoDocumento: string, nroDocumento: string, activateCallback: Function) {
        this.cargando = true;

        let requestBody: any = {};
        if (tipoDocumento === "01") {
            this.cliNatural.codTipoDoc = tipoDocumento;
            this.cliNatural.nroDocumento = nroDocumento;
            requestBody = this.cliNatural;
        } else if (tipoDocumento === "06") {
            this.cliJuridico.codTipoDoc = tipoDocumento;
            this.cliJuridico.nroDocumento = nroDocumento;
            requestBody = this.cliJuridico;
        }

        this.adminService.buscarCliente(!this.reniecSunat, requestBody).pipe(
            /* delay(3000), */
            finalize(() => this.cargando = false),
            catchError((error) => {
                this.showMessage = true;
                if (error.status === 422 || error.status === 404) {
                    this.severity = 'warn';
                    this.message = error.error.message;

                } else {
                    this.severity = 'error';
                    this.message = error?.error?.descripcion ?? "Error inesperado.";
                }
                return throwError(() => error);
            })
        ).subscribe((resp: any) => {
            this.showMessage = false;
            if (resp?.codTipoDoc === "01") {
                this.cliNatural = resp;
                this.cliente = this.cliNatural;
            } else if (resp?.codTipoDoc === "06") {
                this.cliJuridico = resp;
                this.cliente = this.cliJuridico;
            }
            // Validamos correo
            this.validarCorreoExistente(this.correo, activateCallback);
            //activateCallback(2);
        });
    }

    validarCorreoExistente(correo: string, activateCallback: Function) {
        this.cargando = true;
        this.adminService.correoExistente(correo).pipe(
            finalize(() => this.cargando = false),
            catchError((error) => {
                this.showMessage = true;
                if (error.status === 400 || error.status === 409) {
                    if (error.error.codigo === Constantes.STATUS_ERROR_RI) this.severity = 'error'
                    else this.severity = 'warn';
                    this.message = error.error.descripcion;
                }
                else if (error.status === 422) {
                    this.severity = 'warn';
                    this.message = error.error.message;
                } else {
                    this.severity = 'error';
                    this.message = Constantes.MSG_ERROR_SERVICIO;
                }
                return throwError(() => error);
            })
        ).subscribe((resp: any) => {
            if (resp?.codigo === Constantes.STATUS_SUCCESS_RI) {
                //activateCallback(2);
                this.crearCodigoUnico(activateCallback);
            }
        });
    }

    crearCodigoUnico(activateCallback: Function) {
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
                } else if (error.status === 409) {
                    this.data = error.error;
                    if (error.error.data.estado === 'A') {
                        this.headerMessage = "Ya tienes una cuenta registrada";
                        this.bodyMessage = "Tu correo <b>" + this.data.data.descripcion + "</b> está registrado pero inactivo. Para activarla, sigue los pasos que se muestran a continuación."
                        activateCallback(2);
                    }
                    else if (error.error.data.estado === 'I') {
                        this.headerMessage = "Ya tienes una cuenta activa";
                        this.bodyMessage = "Inicia sesión con tu correo <b>" + this.data.data.descripcion + "</b> y tu contraseña. Descarga la app y accede directamente a tu cuenta.";
                        activateCallback(2);
                    }
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
                this.headerMessage = "¡Tu cuenta ha sido creada con éxito!";
                this.bodyMessage = "Hemos generado tu código único <b>" + this.data.data.codigo + "</b>. Ahora sigue los pasos a continuación para completar tu registro."
                activateCallback(2);
            }

        });
    }

    isFormValid(): boolean {
        if (!this.selectedTipoDoc || !this.nroDocumento) {
            return false;
        }

        let valido = false;

        if (this.selectedTipoDoc.codigo === "01") {
            // Validación de DNI (8 dígitos)
            const dniValido = this.nroDocumento.length === 8;
            const nombresValidos = !!this.cliNatural?.nombres?.trim();
            const apellidoPaternoValido = !!this.cliNatural?.apellidoPaterno?.trim();
            const apellidoMaternoValido = !!this.cliNatural?.apellidoMaterno?.trim();

            valido = dniValido && nombresValidos && apellidoPaternoValido && apellidoMaternoValido;
        }

        if (this.selectedTipoDoc.codigo === "06") {
            // Validación de RUC (11 dígitos)
            const rucValido = this.nroDocumento.length === 11;
            const razonSocialValida = !!this.cliJuridico?.razonSocial?.trim();

            valido = rucValido && razonSocialValida;
        }

        // Validación de correo (siempre requerido)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const correoValido = !!this.correo && emailRegex.test(this.correo);

        return valido && correoValido;
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

    updatePantalla(n: number) {
        this.nroPantalla = n;
    }

    messageCopiarCodUnico = "Toca para copiar";
    async copyCodigoOperacion(codigo: string, correo: string): Promise<void> {
        try {

            // Uso de la función
            var texto = "Tu código único es: " + codigo + "\nCorreo afiliado: " + correo;

            this.messageCopiarCodUnico = "¡Copiado!";
            setTimeout(() => {
                this.messageCopiarCodUnico = "Toca para copiar";     // vuelve al original
            }, 3000); // 3 segundos
            this.copyToClipboard(texto);
        } catch (err) {
            // Manejar el error si la operación de copia falla
            this.messageService.add({
                severity: 'error',
                summary: 'Copiar',
                detail: 'Error al copiar al portapapeles.',
                life: 3000
            });
        }
    }

    messaheCopiarUrlStore = "Copiar enlace";
    async copyUrlStore(url: string): Promise<void> {
        try {
            var texto = "Descarga nuestra app en Google Play: " + url;

            this.messaheCopiarUrlStore = "¡Copiado!";
            setTimeout(() => {
                this.messaheCopiarUrlStore = "Copiar enlace";
            }, 3000); // 3 segundos
            this.copyToClipboard(texto);
        } catch (err) {
            // Manejar el error si la operación de copia falla
            this.messageService.add({
                severity: 'error',
                summary: 'Copiar',
                detail: 'Error al copiar al portapapeles.',
                life: 3000
            });
        }
    }

    copyToClipboard(text: string) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

}
