import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { NroCelularDirective } from '../../../components/directives/nro-celular.directive';
import { SoloLetrasDirective } from '../../../components/directives/solo-letras.directive';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-personal',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,
    CommonModule,InputOtpModule,FormsModule,NroCelularDirective,SoloLetrasDirective,
    CardModule,BreadcrumbModule],
  templateUrl: './register-personal.component.html',
  styleUrl: './register-personal.component.scss'
})
export default class RegisterPersonalComponent {
  constructor(private router: Router) {}
  
  ngOnInit() {

    }
  registrarUsuario(){
    this.router.navigate(['inicio']);
  }
}
