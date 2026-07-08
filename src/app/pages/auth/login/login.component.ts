import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Constantes } from '../../../core/constant/Constantes';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { InputOtpModule } from 'primeng/inputotp';
import { SystemService } from '../../../core/services/system/system.service';
import { TempDataService } from '../../../core/services/temp-data.service';
import { CuentasGuardadasService } from '../../../core/services/auth/cuentas-guardadas.service';
import { BiometricAuthService } from '../../../core/services/auth/biometric-auth.service';
import { BiometricActivationComponent } from '../../modal/biometric-activation/biometric-activation.component';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, InputTextModule, CheckboxModule, PasswordModule, FormsModule,
    ConfirmDialogModule, CommonModule, LoadingComponent, InputOtpModule],
  providers: [ConfirmationService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export default class LoginComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  /*Limpiar correo  */
  cleanCorreo: string = 'clean';
  codigoUnico: string = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    private dialogService: DialogService,
    private systemService: SystemService,
    private tempDataService: TempDataService,
    private cuentasGuardadasService: CuentasGuardadasService,
    private biometricAuthService: BiometricAuthService
  ) {
    // Si venimos de "Agregar otra cuenta" en /login-user, se deja el formulario
    // en blanco aunque ya existan cuentas guardadas.
    if (sessionStorage.getItem('modoAgregarCuenta')) {
      sessionStorage.removeItem('modoAgregarCuenta');
      return;
    }

    if (this.cuentasGuardadasService.obtenerCuentaActiva()) {
      router.navigate(['/login-user']);
    }
  }

  ngOnInit(): void {
    const emailCreate = sessionStorage.getItem('emailCreate');
    if (emailCreate) {
      this.credenciales.correo = emailCreate;
      sessionStorage.clear();
    }
  }

  credenciales = {
    correo: '',
    contrasena: ''
  };

  creaHoy() {
    //systemService
    this.loadingComponent.show();

    this.systemService.estadoCrearCu().subscribe({
      next: (response: any) => {
        this.loadingComponent.hide();
        if (response[0].value == 1) {
          this.router.navigate(['/validate']);
        } else this.router.navigate(['/codigo-manual']);
      },
      error: err => {
        this.loadingComponent.hide();
        this.show(Constantes.MSG_500);
      }
    });

  }

  login(form: NgForm) {
    this.loadingComponent.show();
    this.loginService.iniciarSesion(this.credenciales).pipe(
          finalize(() => {
            this.loadingComponent.hide();
          })
    ).subscribe({
      next: response => {
        this.loadingComponent.hide();
        this.cuentasGuardadasService.guardarCuenta(this.credenciales.correo);
        // Se guarda temporalmente para poder confirmar la clave al activar el ingreso con huella
        // desde la pantalla de Configuración, sin tener que pedirla de nuevo por otra vía.
        sessionStorage.setItem('contrasenaSesion', this.credenciales.contrasena);
        sessionStorage.setItem('codTipoDoc', response.data.person.codTipoDoc);
        if (response.data.person.codTipoDoc === "06") {
          sessionStorage.setItem('nombreComercial', response.data.person.nombreComercial);
          sessionStorage.setItem('razonSocial', response.data.person.razonSocial);
        }
        // Guardar temporalmente informacion de configuracion del usuario
        this.tempDataService.setConstant('currency', response.data.config.moneda);
        sessionStorage.setItem('pathLogo', response.data.config.pathLogo);
        sessionStorage.setItem('pathSello', response.data.config.pathSello);

        if (response.codigoMessage === Constantes.STATUS_LOGIN_SUCCESS) {
          this.ofrecerActivarBiometria(this.credenciales.correo, this.credenciales.contrasena);
          this.router.navigate(['inicio']);
        }
        else if (response.codigoMessage === Constantes.COD_MEMBRESIA_POR_VENCER) {
          this.router.navigate(['/membresia-exp'], {
            state: {
              header: 'Membresía por expirar',
              body: response.data.membresia.descripcion
            }
          });

        }
      },
      error: err => {
        this.loadingComponent.hide();
        if (err.status === 401) {
          this.show(Constantes.MSG_401);
        } else if (err.status === 403) {
          if (err.error.codigoMessage === Constantes.COD_MEMBRESIA_VENCIDA) {
            this.router.navigate(['/membresia-ven'], {
              state: {
                header: 'Membresía expirada',
                body: err.error.message
              }
            });
          } else if (err.error.codigoMessage === Constantes.COD_USUARIO_BLOQUEADO) {
            this.router.navigate(['/usuario-sin-acceso'], {
              state: {
                header: 'Usuario sin acceso',
                body: err.error.message
              }
            });
          }
        } else {
          this.show(Constantes.MSG_500);
        }
      }
    });
  }

  /** Tras un login exitoso, ofrece activar el ingreso con huella si el dispositivo lo soporta. */
  private async ofrecerActivarBiometria(correo: string, contrasena: string): Promise<void> {
    const soportado = await this.biometricAuthService.esSoportado();
    if (!soportado) return;
    if (this.biometricAuthService.fueDescartadaParaCuenta(correo)) return;

    const yaActivada = await this.biometricAuthService.estaActivadaParaCuenta(correo);
    if (yaActivada) return;

    const ref = this.dialogService.open(BiometricActivationComponent, {
      showHeader: false,
      closable: false,
      closeOnEscape: false,
      modal: true,
      width: '90%'
    });

    ref.onClose.subscribe((resultado: string) => {
      if (resultado === 'activar') {
        this.biometricAuthService.activarParaCuenta(correo, contrasena);
      } else {
        this.biometricAuthService.marcarDescartadaParaCuenta(correo);
      }
    });
  }

  show(message: string) {
    const ref = this.dialogService.open(MessagePopUpComponent, {
      data: {
        message: message
      },
      header: Constantes.MSG_GLOBAL,
      closable: false,
      modal: true,
      width: '90%'
    });
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.credenciales.correo.trim() !== '' &&
      this.credenciales.contrasena.length === 6
    );
  }

  cleanCorreoFunct() {
    this.cleanCorreo = this.cleanCorreo === 'clean' ? '' : 'clean';
    this.credenciales.correo = '';
  }

}

