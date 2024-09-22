import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Location } from '@angular/common';

@Component({
  selector: 'app-confirm-inversion',
  standalone: true,
  imports: [InputTextareaModule,FloatLabelModule,InputTextModule,FormsModule,CommonModule,ButtonModule],
  templateUrl: './confirm-inversion.component.html',
  styleUrl: './confirm-inversion.component.scss'
})
export default class ConfirmInversionComponent {

  constructor(
    private router: Router,
    private location: Location
  ){}

  objClient: any = {
    "persona": {
        "nombres": "Jose Octavio",
        "apellidoPaterno": "Cerron",
        "apellidoMaterno": "Vicente",
        "celular": "921 754 924",
        "direccion": "AAHH. Las viñas de los milagros",
        "fullName": "",
        "comentario":""
    },
    "monto": 1200.00,
    "cuotas": 30,
    "interes": 20,
    "valorCuota": 60.00,
    "fechaInicio": "03/09/24 17:46",
    "fechaFin": "03/10/24 17:46",
    "comentario": "Esta dejando de garantia ciertas cosas de valor.Esta dejando de garantia ciertas cosas de valor.Esta dejando de garantia ciertas cosas de valor."
};

registerInvTrue(){
  this.router.navigate(['registrar/inversiondetalle'])
}

volver() {
  this.location.back();
}

}
