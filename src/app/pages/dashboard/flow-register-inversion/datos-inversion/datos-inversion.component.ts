import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { Location } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { catchError, finalize, lastValueFrom, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LoadingComponent } from '../../../modal/loading/loading.component';


@Component({
  selector: 'app-datos-inversion',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,InputOtpModule,FormsModule,
    NroCelularDirective,SoloLetrasDirective,CardModule,BreadcrumbModule,InputNumberModule,CalendarModule,
    CommonModule,KnobModule,LoadingComponent
  ],
  templateUrl: './datos-inversion.component.html',
  styleUrl: './datos-inversion.component.scss'
})
export default class DatosInversionComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  valueMonto: number | null = null;
  selected: number = 0; // Ningún botón seleccionado inicialmente

  //Interes
  valueInteres: number = 20;
  valueInteresPerso: number | null = null;
  statusPersonalizado = false;

  //Cuota
  nroCuota: number = 0;
  valorCuota: number = 0; // get simulacion
  cuotaCargada: boolean = true;

  //fecha inicio y fin
  statusFecha: boolean = false;
  date1: Date = new Date();
  date2: Date | null = null;

  constructor(
    private router: Router,
    private location: Location,
    private getInversionService: GetInversionService,
    private messageService: MessageService,
  ){}

  ngOnInit() {
    const obj = sessionStorage.getItem('objInversion');
    if(obj) {
      const objnew = JSON.parse(obj);
      this.valueMonto = objnew.monto;
      this.valueInteres = !objnew.statusPersonalizado?objnew.interes:20;
      this.valueInteresPerso = objnew.statusPersonalizado?objnew.interesPerso:null;
      this.statusPersonalizado = objnew.statusPersonalizado,
      this.statusFecha = objnew.statusFecha;
      if(objnew.statusFecha){
        this.date1 = new Date(objnew.fechaInicio);
      }
      this.selectButton(objnew.selected, objnew.nroCuotas); //actualiza cuota
    }
  }  

  ngAfterViewInit(): void {
    this.getValidationValues();
  }

  async validarDatosInversion(){
  if(!this.isFormValid()) return;
    const request = {
      monto: this.valueMonto,
      nroCuotas: this.nroCuota,
      interes: !this.statusPersonalizado?this.valueInteres:null,
      interesPerso: this.statusPersonalizado?this.valueInteresPerso:null,
      statusPersonalizado: this.statusPersonalizado,
      fechaInicio: this.statusFecha==false?null:this.getFormattedDate(this.date1),
      fechaFin: this.statusFecha==false?null:this.getFormattedDate(this.date2),
      statusFecha: this.statusFecha,
      selected: this.selected
    }
    sessionStorage.setItem('objInversion',JSON.stringify(request));
    this.router.navigate(['registrar/datoscliente']);
}

getValidationValues() {
  this.loadingComponent.show();
    this.getInversionService.getValidationValues().pipe(
    finalize(() => this.loadingComponent.hide()),
    catchError((error) => {
      this.handleCuotaSelection();
      return of(null); 
    })
  ).subscribe((resp: any) => {
    if (resp) {
      this.objValidationValues = resp;
      this.handleCuotaSelection();
    }
  });
}

private handleCuotaSelection() {
  if(this.selected != 0) return;
  const cuota24 = this.objValidationValues?.cuotas?.find((cuota: any) => cuota.valor === 24);
  if (cuota24) {
    this.nroCuota = cuota24.valor;
    this.selected = this.objValidationValues.cuotas.indexOf(cuota24) + 1; // Asegúrate de que el índice sea correcto
  }
}

volver() {
  this.location.back();
}

simularCuota(){
  if(!this.isFormValid()) return;
  const request = {
    monto: this.valueMonto,
    cuotas: this.nroCuota,
    interes: this.valueInteresPerso==null?this.valueInteres:this.valueInteresPerso
  }
  this.cuotaCargada = false;
  this.getInversionService.sendSimulation(request).pipe(
    finalize(() => this.cuotaCargada = true),
    catchError((error) => {
      this.messageService.add({severity: 'error', summary: 'SE', detail: 'Error al simular cuota.', life: 3000});
      this.valorCuota = 0;
      return of(null); 
    })
  ).subscribe((resp: any) => {
    if (resp) {
      this.valorCuota = resp.valorCuota;
    }
  });
}

/* async simularCuota(): Promise<void> {
  if (!this.isFormValid()) return;
  const request = {
      monto: this.valueMonto,
      cuotas: this.nroCuota,
      interes: this.valueInteresPerso == null ? this.valueInteres : this.valueInteresPerso,
  };
  this.cuotaCargada = false;
  try {
      // Convertimos el observable a promesa usando lastValueFrom
      const resp: any = await lastValueFrom(
          this.getInversionService.sendSimulation(request).pipe(
              finalize(() => this.cuotaCargada = true),
              catchError((error) => {
                  this.messageService.add({ severity: 'error', summary: 'SE', detail: 'Error al simular cuota.', life: 3000 });
                  this.valorCuota = 0;
                  return of(null); // Asegúrate de que aquí devuelves un observable
              })
          )
      );
      if (resp) {
          this.valorCuota = resp.valorCuota; // Asignar el valor de cuota desde la respuesta
      }
  } catch (error) {
      console.error("Error en la simulación de cuota:", error);
      this.valorCuota = 0; // Manejar el error y restablecer valorCuota si es necesario
  }
} */

clicFechaInicioFin(){
  //this.statusFecha = !this.statusFecha;
  this.updateDate2();
}

  clicIntPersonalizado(){
    //this.interesPersonalizado = !this.interesPersonalizado;
    this.valueInteresPerso = null;
  }

  selectButton(buttonNumber: number, cuota:number): void {
    this.selected = buttonNumber; // Actualiza el botón seleccionado
    this.nroCuota = cuota;
    this.setearFechaInicio();
    this.updateDate2();
  }

  setearFechaInicio(){
    if (this.date1) {
      const newFecha = new Date(); 
      if(this.nroCuota==4) newFecha.setDate(newFecha.getDate() + 7);
      else newFecha.setDate(newFecha.getDate() + 1); 
      this.date1 = newFecha;
    }
  }

  updateDate2() {
    if (this.date1) {
      const newFecha2 = new Date(this.date1); 
      newFecha2.setDate(newFecha2.getDate() + (this.nroCuota==4 ? 21 : this.nroCuota - 1 ) );
      this.date2 = newFecha2;
    } else {
      this.date2 = null; // Limpiar date2 si date1 no está definido
    }
  }

      // Método para verificar si todos los campos obligatorios están llenos
      isFormValid(): boolean {
        return (
          this.valueMonto !== null && this.valueMonto !== 0 &&
          this.nroCuota !== null && this.nroCuota !== 0 &&
          (this.valueInteresPerso==null?this.valueInteres:this.valueInteresPerso) !== null &&
          (this.valueInteresPerso==null?this.valueInteres:this.valueInteresPerso) !== 0 
        );
    }

    getFormattedDate(date: any): string | null {
      if (!date) {
        return null; // Retorna null si la fecha es null
    }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 porque los meses son 0-indexados
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
  
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

objValidationValues: any = {
  "montoLimit": {
      "codMonto": "MON3",
      "montoMin": 1,
      "montoMax": 10000
  },
  "interesLimit": {
      "codInteres": "INT2",
      "interesMin": 1,
      "interesMax": 2000
  },
  "cuotas": [
      {
          "codCuota": "CUO1",
          "valor": 7
      },
      {
          "codCuota": "CUO2",
          "valor": 24
      },
      {
          "codCuota": "CUO3",
          "valor": 30
      }
  ]
}

}
