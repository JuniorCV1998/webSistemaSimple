import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { Router } from '@angular/router';
import { LoginService } from '../../../core/services/auth/login/login.service';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(
    private router: Router,
    private loginService:LoginService,
  ) {}

/*   iniciarSesion(){
    this.router.navigate(['inicio']);
  } */
    credenciales = {
      usuario: '',
      contrasena: ''
    };

    iniciarSesion(form: NgForm){
    console.log("credenciales: " + JSON.stringify(this.credenciales));
    this.router.navigate(['inicio']);
/*     this.loginService.loguearse(this.credencial).subscribe(response =>{
      this.router.navigate(['navigation/inversiones']);
      
      
    },  ) */
  }
}

/* err =>{
      500
      console.log("Algo salio mal: "+err)
    } */