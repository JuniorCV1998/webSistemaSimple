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

  objNuevaInv: any = {};

  constructor(
    private router: Router,
    private location: Location
  ){
    // recuperando objeto nueva inversion
    const obj = sessionStorage.getItem('objNuevaInv');
    if(obj) {
      this.objNuevaInv = JSON.parse(obj);
    }
  }

  ngOnInit(): void{
    console.log("objeto recuperado: "+JSON.stringify(this.objNuevaInv));
  }


/*   objClient: any = {
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
}; */

registerInvTrue(){
  /* const objNuevaInv = {
    fkUsuario : this.statusClient==1?this.objClient?.idUsuario:null,
    // objeto inversion
    monto: this.objInversion.monto,
    nroCuotas: this.objInversion.nroCuotas,
    interes: this.objInversion.interes,
    fechaInicio: this.objInversion.fechaInicio,
    fechaFin: this.objInversion.fechaFin,
    //comentario
    comentario: this.txtComentario.trim(),
    // objeto cliente
    nombres: this.statusClient==2?this.objClient.persona.nombres.trim():null,
    apellidoPaterno: this.statusClient==2?this.objClient.persona.apellidoPaterno.trim():null,
    apellidoMaterno: this.statusClient==2?this.objClient.persona.apellidoMaterno.trim():null,
    celular: this.statusClient==2?this.formatCelular(this.objClient.persona.celular.trim()):null,
    direccion: this.statusClient==2?this.objClient.persona.direccion.trim():null,
    // validate
    validado: false
} */
  //this.router.navigate(['registrar/inversiondetalle'])
}

// Método para formatear la fecha
formatearFecha(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  //return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}


}
