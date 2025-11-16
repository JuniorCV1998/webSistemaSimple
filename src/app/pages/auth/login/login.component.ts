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
    private tempDataService: TempDataService
  ) {
    const correo = localStorage.getItem('correo');
    if (correo) router.navigate(['/login-user']);
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
    this.loginService.iniciarSesion(this.credenciales).subscribe({
      next: response => {
        this.loadingComponent.hide();
        localStorage.setItem('correo', this.credenciales.correo);
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

