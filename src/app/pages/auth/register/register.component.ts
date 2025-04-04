import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';
import { InputOtpModule } from 'primeng/inputotp';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RegisterService } from '../../../core/services/auth/register/register.service';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';
import { SoloNumerosDirective } from '../../../components/directives/solo-numeros.directive';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,CommonModule,InputOtpModule,FormsModule,
    LoadingComponent,SoloNumerosDirective
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export default class RegisterComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  codRegisterValidate: number | null = null;

  objUser: any = {
    codRegisterValidate: null,
    correo: "",
    contrasena: "",
    contrasena2: "",
    codigoUnico: ""
  }

  codigoUnico: string = '';

  /* Mostrar/ocultar contraseña */
  passwordFieldType: string = 'password';
  passwordFieldType2: string = 'password';
  isValidPassword: boolean = false;

  constructor(
    private router: Router,
    private location: Location,
    private registerService: RegisterService,
    private dialogService: DialogService,
  ) {
    const objUser = sessionStorage.getItem('objUser');
    if(objUser) {
      this.objUser = JSON.parse(objUser);
      this.codigoUnico = this.objUser?.codigoUnico.replace("SS-","");
      this.isValidPassword = this.validarContrasena(this.objUser?.contrasena.trim());
    }else this.codRegisterValidate = null;
  }

  isWriting: boolean = false;
  isWritingP: boolean = false;
  valueShow: string = '_ _ _ _ _ _';

  ngOnInit(): void{
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('correo');
  }

  ngAfterViewInit(): void{
    this.onInputChange();
  }

  volver() {
    this.location.back();
  }

validarDatos(){
  this.loadingComponent.show();
  this.objUser.codigoUnico = "SS-" + this.codigoUnico;
  this.registerService.validateRegister(this.objUser).pipe(
    finalize(() => this.loadingComponent.hide()),
    catchError((error) => {
      if (error.status === 400) {
        if(error.error.descripcion!=undefined) this.show(error.error.descripcion, Constantes.MSG_H_400, false);
        else this.show(error.error.message, Constantes.MSG_H_400, true);
      } else {
        this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
      }
      // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
      return of(null);
    })
  ).subscribe((resp: any) => {
    if (resp?.codigoMessage==Constantes.STATUS_SUCCESS_RI) {
      this.objUser.codRegisterValidate = resp.data;
      sessionStorage.setItem('objUser',JSON.stringify(this.objUser));
      this.router.navigate(['registrar/personal']);
    }
  });
}

show(message: string, header: string, irInicio: boolean) {
const ref = this.dialogService.open(MessagePopUpComponent, {
  data: {
    message: message
  },
  header: header,
  closable: false,
  closeOnEscape: false,
  modal: true,         
  width: '90%'
});

// Suscribirse al evento de cierre del diálogo
ref.onClose.subscribe((result: any) => {
  if (result === 'aceptar') {
    if(irInicio) this.router.navigate(['/login']);
  }
});
}


  onFocus(value:number) {
    if(value==1) this.isWriting = true;
    if(value==2) this.isWritingP = true;
  }

  onBlur(value: number) {
    if(value==1) this.isWriting = false;
    if(value==2) this.isWritingP = false;
  }

  onInputChange(){
    let n = this.codigoUnico.length;
    switch (n) {
      case 1:
        this.valueShow = this.codigoUnico + "_ _ _ _ _";
        break;
      case 2:
          this.valueShow = this.codigoUnico + "_ _ _ _";
          break;
      case 3:
          this.valueShow = this.codigoUnico + "_ _ _";
          break;
      case 4:
          this.valueShow = this.codigoUnico + "_ _";
          break;
      case 5:
          this.valueShow = this.codigoUnico + "_";
          break;
      case 6:
          this.valueShow = this.codigoUnico;
          break;            
      default:
        this.valueShow = "_ _ _ _ _ _";
        break;
    }
    this.codigoUnico;
  }

  togglePasswordVisibility(n: number) {
    if(n == 1) this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    if(n == 2) this.passwordFieldType2 = this.passwordFieldType2 === 'password' ? 'text' : 'password';
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.objUser?.correo?.trim() !== '' &&
      this.objUser?.contrasena?.trim() !== '' &&
      this.objUser?.contrasena2?.trim() !== ''  &&
      this.codigoUnico.trim() !== '' &&
      this.codigoUnico.length == 6 &&
      this.isValidPassword == true
    );
}

validarContrasena(contrasena: string): boolean {
  const regex = /^\d{6}$/; // Solo 6 dígitos numéricos
  return regex.test(contrasena);
}

}
