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
import { ConfirmDialogModule } from 'primeng/confirmdialog';  // Asegúrate de importar el módulo correcto
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Constantes } from '../../../core/constant/Constantes';
import { LoadingComponent } from '../../modal/loading/loading.component';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,FormsModule,
    ConfirmDialogModule,CommonModule,LoadingComponent],
  providers: [ConfirmationService],
  templateUrl: './login.component.html', 
  styleUrl: './login.component.scss'
})
export default class LoginComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  
  /* Mostrar/ocultar contraseña */
  passwordFieldType: string = 'password';
  
  constructor(
    private router: Router,
    private loginService:LoginService,
    public dialogService: DialogService,
  ) {}

    credenciales = {
      correo: '',
      contrasena: ''
    };

    creaHoy(){
      this.router.navigate(['/registrar']);
    }

    login(form: NgForm) {
      this.loadingComponent.show();
      this.loginService.iniciarSesion(this.credenciales).subscribe({
        next: response => {
          this.loadingComponent.hide();
          this.router.navigate(['inicio']);
        },
        error: err => {
          this.loadingComponent.hide();
          if (err.status === 401) {
            this.show(Constantes.MSG_401);
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
          this.credenciales.contrasena.trim() !== ''
        );
    }

    togglePasswordVisibility() {
      this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    }

}

