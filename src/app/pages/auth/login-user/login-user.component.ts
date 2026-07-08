import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { TempDataService } from '../../../core/services/temp-data.service';
import { CuentasGuardadasService } from '../../../core/services/auth/cuentas-guardadas.service';
import { BiometricAuthService } from '../../../core/services/auth/biometric-auth.service';
import { BiometricActivationComponent } from '../../modal/biometric-activation/biometric-activation.component';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [ButtonModule, InputTextModule, CheckboxModule, PasswordModule, FormsModule,
    ConfirmDialogModule, CommonModule, LoadingComponent],
  templateUrl: './login-user.component.html',
  styleUrl: './login-user.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class LoginUserComponent implements AfterViewInit {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  @ViewChild('carousel') carouselRef!: ElementRef<HTMLDivElement>;

  /* Cuentas guardadas (hasta 3) y carrusel para moverse entre ellas */
  cuentas: string[] = [];
  cuentaActivaIndex: number = 0;
  modoEdicion: boolean = false;
  private scrollTimeout: any;

  /* Ingreso con huella para la cuenta activa del carrusel */
  biometriaDisponibleActiva: boolean = false;

  appVersion = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    private dialogService: DialogService,
    private tempDataService: TempDataService,
    private cuentasGuardadasService: CuentasGuardadasService,
    private biometricAuthService: BiometricAuthService
  ) {
    const cuentas = this.cuentasGuardadasService.obtenerCuentas();
    if (cuentas.length === 0) {
      router.navigate(['/login']);
      return;
    }

    this.cuentas = cuentas;
    const activa = this.cuentasGuardadasService.obtenerCuentaActiva();
    const idx = activa ? cuentas.indexOf(activa) : -1;
    this.cuentaActivaIndex = idx >= 0 ? idx : 0;
  }

  ngOnInit(): void {
    App.getInfo().then(info => {
      this.appVersion = info.version;
    });
    this.actualizarDisponibilidadBiometria();
  }

  ngAfterViewInit(): void {
    const el = this.carouselRef?.nativeElement;
    if (el && this.cuentaActivaIndex > 0) {
      el.scrollLeft = this.cuentaActivaIndex * el.clientWidth;
    }
  }

  get correo(): string {
    return this.cuentas[this.cuentaActivaIndex] ?? '';
  }

  credenciales = {
    correo: '',
    contrasena: ''
  };

  /* Detecta a qué cuenta del carrusel se deslizó el usuario */
  onCarouselScroll(): void {
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => this.actualizarCuentaActivaPorScroll(), 120);
  }

  private actualizarCuentaActivaPorScroll(): void {
    const el = this.carouselRef?.nativeElement;
    if (!el || el.clientWidth === 0) return;

    const index = Math.round(el.scrollLeft / el.clientWidth);
    const clamped = Math.max(0, Math.min(index, this.cuentas.length - 1));
    if (clamped !== this.cuentaActivaIndex) {
      this.cuentaActivaIndex = clamped;
      this.enteredCode = [];
      this.cuentasGuardadasService.establecerCuentaActiva(this.correo);
      this.actualizarDisponibilidadBiometria();
    }
  }

  private async actualizarDisponibilidadBiometria(): Promise<void> {
    const correo = this.correo;
    const soportado = await this.biometricAuthService.esSoportado();
    this.biometriaDisponibleActiva = soportado && await this.biometricAuthService.estaActivadaParaCuenta(correo);
  }

  /** Ingreso rápido con huella para la cuenta activa del carrusel. */
  async ingresarConBiometria(): Promise<void> {
    const credenciales = await this.biometricAuthService.autenticarYObtenerCredenciales(this.correo);
    if (!credenciales) return; // cancelado o fallido: el usuario sigue con el teclado normal
    this.credenciales.contrasena = credenciales.password;
    this.login();
  }

  irACuenta(index: number): void {
    const el = this.carouselRef?.nativeElement;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }

  usarOtraCuenta(event: Event) {
    // Evita que el clic burbujee hasta el contenedor y cancele el modo edición recién activado
    event.stopPropagation();
    if (this.cuentasGuardadasService.haAlcanzadoLimite()) {
      this.modoEdicion = true;
      return;
    }
    this.irAAgregarCuenta();
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
  }

  eliminarCuenta(index: number, event: Event): void {
    event.stopPropagation();
    const correoEliminado = this.cuentas[index];
    this.cuentas = this.cuentasGuardadasService.eliminarCuenta(correoEliminado);
    this.biometricAuthService.desactivarParaCuenta(correoEliminado);

    if (this.cuentas.length === 0) {
      this.router.navigate(['/login']);
      return;
    }

    this.cuentaActivaIndex = Math.min(this.cuentaActivaIndex, this.cuentas.length - 1);
    this.enteredCode = [];
    this.modoEdicion = false;
    // Ya hay espacio libre: continuamos directo al flujo de agregar cuenta
    this.irAAgregarCuenta();
  }

  private irAAgregarCuenta(): void {
    sessionStorage.clear();
    sessionStorage.setItem('modoAgregarCuenta', 'true');
    this.router.navigate(['/login']);
  }

  login() {
    this.credenciales.correo = this.correo;

    this.loadingComponent.show();
    this.loginService.iniciarSesion(this.credenciales).pipe(
      finalize(() => {
        this.enteredCode = [];
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: response => {
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
        }
        else {
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
        this.biometricAuthService.activarParaCuenta(correo, contrasena).then(() => this.actualizarDisponibilidadBiometria());
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
      closeOnEscape: false,
      modal: true,
      width: '90%'
    });
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.credenciales.correo.trim() !== '' &&
      /* this.credenciales.contrasena.trim() !== '' && */
      this.enteredCode.length === 6
    );
  }

  /* LOGICA PARA EL TECLADO ALEATORIO */

  // El código ingresado por el usuario
  enteredCode: string[] = [];

  // Números aleatorios para el teclado
  randomNumbers: number[] = this.generateRandomNumbers();

  // Genera un arreglo con los números del 0 al 9 en un orden aleatorio
  generateRandomNumbers(): number[] {
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  }

  // Llamado cuando el usuario presiona un número
  onDigitPress(number: number): void {
    if (this.enteredCode.length < 6) {
      this.enteredCode.push(number.toString());
    } if (this.enteredCode.length == 6) {
      this.credenciales.contrasena = this.enteredCode.join('');
      this.login();
    } else {
      this.credenciales.contrasena = '';
    }
  }

  // Eliminar el último dígito ingresado
  onDelete(): void {
    if (this.enteredCode.length > 0) {
      this.enteredCode.pop();  // Elimina el último elemento del código
    }
  }

}
