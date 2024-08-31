import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputOtpModule } from 'primeng/inputotp';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Router } from '@angular/router';
import { NroCelularDirective } from '../../../../components/directives/nro-celular.directive';
import { SoloLetrasDirective } from '../../../../components/directives/solo-letras.directive';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule  } from 'primeng/calendar';
import { CommonModule } from '@angular/common'; // Asegúrate de importar CommonModule
import { KnobModule } from 'primeng/knob';



@Component({
  selector: 'app-datos-inversion',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,InputOtpModule,FormsModule,
    NroCelularDirective,SoloLetrasDirective,CardModule,BreadcrumbModule,InputNumberModule,CalendarModule,
    CommonModule,KnobModule
  ],
  templateUrl: './datos-inversion.component.html',
  styleUrl: './datos-inversion.component.scss'
})
export default class DatosInversionComponent {

  value3: number = 2351.35;
  selected: number = 0; // Ningún botón seleccionado inicialmente

  //Interes
  value: number = 20;
  interesPersonalizado = false;
  formGroup: FormGroup | undefined;

  //Cuota
  valorCuota: number = 0;

  //fecha inicio y fin
  establecerFecha: boolean = false;
  date1: Date = new Date();
  date2: Date | undefined;

  constructor(private router: Router){}

  ngOnInit() {
    this.formGroup = new FormGroup({
        city: new FormControl<string | null>(null)
    });


}

validarDatosInversion(){
  this.router.navigate(['registrar/datoscliente']);
}

simularCuota(){
  this.valorCuota = 60.00;
}

clicFechaInicioFin(){
  this.establecerFecha = !this.establecerFecha;
}

  clicIntPersonalizado(){
    this.interesPersonalizado = !this.interesPersonalizado;
  }

  selectButton(buttonNumber: number): void {
    this.selected = buttonNumber; // Actualiza el botón seleccionado
  }



}
