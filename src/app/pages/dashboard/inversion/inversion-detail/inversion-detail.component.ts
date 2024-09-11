import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-inversion-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inversion-detail.component.html',
  styleUrl: './inversion-detail.component.scss'
})
export default class InversionDetailComponent {

  idInversion: number | null = null;

  //inversion detail
  //-->invDetail: any = {}
  nroCuotas: number = 24;
  nroCuotasPendientes = 0;

  constructor(private route: ActivatedRoute){}
  
  ngOnInit(): void {
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversion');
      this.idInversion = id ? +id : null; // Convertir a número si existe
      console.log('ID de Inversión recibido:', this.idInversion);
    });

    this.calcularCuotasPendientes();
  }


  pagarCuota(nroCuota: number){
    alert("nro cuota: "+nroCuota);
  }
  
  calcularCuotasPendientes(){
    const countNonNullFP = Object.keys(this.invDetail)
    .filter(key => key.startsWith('fp') && this.invDetail[key] !== null).length;
    this.nroCuotasPendientes = this.nroCuotas - countNonNullFP;
  }

  invDetail: any = {
    "idInversion": 30,
    "persona": {
        "idPersona": null,
        "nombres": "Wuanyilo",
        "apellidoPaterno": "Moto",
        "apellidoMaterno": "Torres",
        "celular": "909090999",
        "direccion": "cañete de lima"
    },
    "monto": 5000.0,
    "nroCuotas": 24,
    "interes": 20.0,
    "valorCuota": 250.0,
    "fechaRegistro": "07 de sept. 2024 - 10:48 a. m.",
    "fechaInicio": "05 de may. 2024 - 12:12 p. m.",
    "fechaFin": "09 de may. 2024 - 12:12 p. m.",
    "credenciales": {
        "correo": "wuanyilo43@ssimple.com",
        "contrasena": "43wuany070"
    },
    "comentario": "Primera inversion con este cliente produccion.",
    "fp1": "03/09/24 17:45",
    "fp2": "03/09/24 17:45",
    "fp3": "03/09/24 17:45",
    "fp4": "03/09/24 17:45",
    "fp5": "03/09/24 17:45",
    "fp6": null,
    "fp7": null,
    "fp8": null,
    "fp9": null,
    "fp10": null,
    "fp11": null,
    "fp12": null,
    "fp13": null,
    "fp14": null,
    "fp15": null,
    "fp16": null,
    "fp17": null,
    "fp18": null,
    "fp19": null,
    "fp20": null,
    "fp21": null,
    "fp22": null,
    "fp23": null,
    "fp24": null,
    "fp25": null,
    "fp26": null,
    "fp27": null,
    "fp28": null,
    "fp29": null,
    "fp30": null
}
}
