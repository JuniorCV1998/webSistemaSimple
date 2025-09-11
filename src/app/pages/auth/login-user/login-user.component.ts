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
import { finalize } from 'rxjs';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-login-user',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,FormsModule,
    ConfirmDialogModule,CommonModule,LoadingComponent],
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
      private loginService:LoginService,
      public dialogService: DialogService,
    ) {
      const correo = localStorage.getItem('correo');
      if(correo) this.correo = correo;
      else router.navigate(['/login']);
    }
  
    ngOnInit(): void{
      console.log("Afuera de logica.");
      App.getInfo().then(info => {
          this.appVersion = info.version;
        });
    }
  
      credenciales = {
        correo: '',
        contrasena: ''
      };
  
      usarOtraCuenta(){
        this.clearSessionAndLocalStorage([]);
        this.router.navigate(['/login']);
      }
  
      login() {
        this.credenciales.correo = localStorage.getItem('correo') ?? '';
        
        this.loadingComponent.show();
        this.loginService.iniciarSesion(this.credenciales).pipe(
            finalize(() => this.enteredCode = [])).subscribe({
          next: response => { 
            this.loadingComponent.hide();
            sessionStorage.setItem('codTipoDoc', response.data.person.codTipoDoc);
            sessionStorage.setItem('nombreComercial', response.data.person.nombreComercial);
            sessionStorage.setItem('razonSocial', response.data.person.razonSocial);
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
        } if (this.enteredCode.length == 6){
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
