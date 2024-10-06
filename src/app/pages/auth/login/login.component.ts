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

  ngOnInit(): void{
    this.clearSessionStorageExcept(['correo']);
    const obj = sessionStorage.getItem('correo');
    if(obj) {
      this.credenciales.correo = obj;
    }
  }

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

    clearSessionStorageExcept(keysToKeep: string[]) {
      // Guardar las claves y valores que no se deben eliminar
      const valuesToKeep: { [key: string]: string | null } = {};
    
      keysToKeep.forEach((key) => {
        const value = sessionStorage.getItem(key);
        if (value !== null) {
          valuesToKeep[key] = value;
        }
      });
    
      // Limpiar todo el sessionStorage
      sessionStorage.clear();
    
      // Restaurar los valores que queremos conservar
      Object.keys(valuesToKeep).forEach((key) => {
        sessionStorage.setItem(key, valuesToKeep[key]!);
      });
    }

}

