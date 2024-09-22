import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule  } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inversion-detail',
  standalone: true,
  imports: [ButtonModule,CommonModule,ToastModule,TabMenuModule,ConfirmDialogModule,CalendarModule,FormsModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './inversion-detail.component.html',
  styleUrl: './inversion-detail.component.scss'
})
export default class InversionDetailComponent {
  fromList: boolean = false;
  idInversion: number | null = null;
  //Mostrar clave usuario
  mostrar: boolean = false;
  copy: boolean = false;

  //inversion detail
  //-->invDetail: any = {}
  nroCuotas: number = 24;
  nroCuotasPendientes = 0;

  //Fecha a pagar
  date: Date = new Date();

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private location: Location
  ){}
  
  ngOnInit(): void {
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversion');
      const fromView = params.get('from');
      if(fromView == 'list') this.fromList = true;
      console.log("vengo desde: "+fromView);
      this.idInversion = id ? +id : null; // Convertir a número si existe
      console.log('ID de Inversión recibido:', this.idInversion);
    });

    this.calcularCuotasPendientes();
  }

  volver() {
    this.location.back();
  }

  mostrarContrasena(){
    this.mostrar = !this.mostrar;
  }
  copyCredentials(){
    if(this.copy == false) this.copy = true;

    this.copyText(this.invDetail.credenciales.correo, this.invDetail.credenciales.contrasena);
  }

  pagarCuota(nroCuota: number){
    this.confirm(nroCuota);
  }
  
  calcularCuotasPendientes(){
    const countNonNullFP = Object.keys(this.invDetail)
    .filter(key => key.startsWith('fp') && this.invDetail[key] !== null).length;
    this.nroCuotasPendientes = this.nroCuotas - countNonNullFP;
  }

  confirm(nroCuota: number) {
    this.date = new Date();
    this.confirmationService.confirm({
        header: 'Pagar cuota',
        message: 'Confirme la fecha de pago de la cuota número '+nroCuota+'.',
        accept: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cuota actualizada', life: 3000 });
            alert("La fecha es: " + this.date);
        },
        reject: () => {
            /* this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 }); */
        }
    });
}

  invDetail: any = {
    "idInversion": 30,
    "persona": {
        "idPersona": null,
        "nombres": "Angeles maria",
        "apellidoPaterno": "Quispe",
        "apellidoMaterno": "Casas",
        "celular": "909090999",
        "direccion": "AAHH Las viñas de los milagros mz j lt 6, san vicente de cañete"
    },
    "monto": 5000.0,
    "nroCuotas": 24,
    "interes": 20.0,
    "valorCuota": 250.0,
    "fechaRegistro": "27 de Ago. 2024 - 16:08 p.m.",
    "fechaInicio": "28/08/24 17:30",
    "fechaFin": "28/09/24 17:30",
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

async copyText(correo: string, contra: string): Promise<void> {
  try {
    var nombreCompleto = this.invDetail.persona.nombres;
    var palabras = nombreCompleto.trim().split(' ');
    var texto = palabras[0]+", usa estas credenciales para iniciar sesión en el sistema:\n\n"+"Correo: "+correo +"\n"+"Contraseña: "+contra;
    await navigator.clipboard.writeText(texto);
    // Mostrar una notificación o mensaje opcional
    this.messageService.add({
      severity: 'info',
      summary: 'Copiar',
      detail: 'Texto copiado al portapapeles.',
      life: 3000
    });
  } catch (err) {
    // Manejar el error si la operación de copia falla
    this.messageService.add({
      severity: 'error',
      summary: 'Copiar',
      detail: 'Error al copiar al portapapeles.',
      life: 3000
    });
    console.error('Error al copiar al portapapeles:', err);
  }
}


}
