import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
import { LoadingComponent } from '../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [ButtonModule, InputTextModule, CheckboxModule, PasswordModule, FormsModule,
    ConfirmDialogModule, CommonModule, LoadingComponent],
  templateUrl: './login-user.component.html',
  styleUrl: './login-user.component.scss'
})
export default class LoginUserComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  /* Mostrar/ocultar contraseña */
  passwordFieldType: string = 'password';
  /* Limpiar caja de email */
  emailClean: string = 'clean'

  /* LOGIN USER */
  correo: string = '';
  appVersion = '';

  constructor(
    private router: Router,
    private loginService: LoginService,
    private dialogService: DialogService,
    private tempDataService: TempDataService
  ) {
    const correo = localStorage.getItem('correo');
    if (correo) this.correo = correo;
    else router.navigate(['/login']);
  }

  ngOnInit(): void {
    App.getInfo().then(info => {
      this.appVersion = info.version;
    });
  }

  credenciales = {
    correo: '',
    contrasena: ''
  };

  usarOtraCuenta() {
    this.clearSessionAndLocalStorage([]);
    this.router.navigate(['/login']);
  }

  login() {
    this.credenciales.correo = localStorage.getItem('correo') ?? '';

    this.loadingComponent.show();
    this.loginService.iniciarSesion(this.credenciales).pipe(
      finalize(() => {
        this.enteredCode = [];
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: response => {
        sessionStorage.setItem('codTipoDoc', response.data.person.codTipoDoc);
        if (response.data.person.codTipoDoc === "06") {
          sessionStorage.setItem('nombreComercial', response.data.person.nombreComercial);
          sessionStorage.setItem('razonSocial', response.data.person.razonSocial);
        }
        // Guardar temporalmente informacion de configuracion del usuario
        this.tempDataService.setConstant('currency', response.data.config.moneda);
        sessionStorage.setItem('pathLogo', response.data.config.pathLogo);
        sessionStorage.setItem('pathSello', response.data.config.pathSello);

        if (response.codigoMessage === Constantes.STATUS_LOGIN_SUCCESS) this.router.navigate(['inicio']);
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

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  clearSessionAndLocalStorage(keysToKeep: string[]) {
    sessionStorage.clear();
    localStorage.clear();
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
