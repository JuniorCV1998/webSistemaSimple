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
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule  } from 'primeng/calendar';
import { CommonModule } from '@angular/common'; // Asegúrate de importar CommonModule
import { KnobModule } from 'primeng/knob';
import { Location } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { catchError, finalize, of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FloatLabelModule } from 'primeng/floatlabel';


@Component({
  selector: 'app-datos-inversion',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,PasswordModule,InputOtpModule,FormsModule
            ,CardModule,BreadcrumbModule,InputNumberModule,CalendarModule,
           CommonModule,KnobModule,LoadingComponent,InputTextareaModule,FloatLabelModule
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
  frecuencia: string = '';
  valorCuota: number = 0; // get simulacion
  cuotaCargada: boolean = true;

  //fecha inicio y fin
  date1: Date = new Date();
  date2: Date | null = null;

  //comentario
  comentario: string = '';

  constructor(
    private router: Router,
    private location: Location,
    private getInversionService: GetInversionService,
    private messageService: MessageService,
    private tempDataService: TempDataService
  ){}

  ngOnInit() {
    if(this.tempDataService.hasItem('objInversion')) {
      const objnew = this.tempDataService.getItem<any>('objInversion');
      this.valueMonto = objnew.monto;
      this.valueInteres = !objnew.statusPersonalizado?objnew.interes:20;
      this.valueInteresPerso = objnew.statusPersonalizado?objnew.interesPerso:null;
      this.statusPersonalizado = objnew.statusPersonalizado,
      this.date1 = new Date(objnew.fechaInicio);
      this.comentario = objnew.comentario;
      this.selectButton(objnew.selected, objnew.nroCuotas, objnew.codigo); //actualiza cuota
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
      interes: this.statusPersonalizado?this.valueInteresPerso:this.valueInteres,
      interesPerso: this.statusPersonalizado?this.valueInteresPerso:null,
      statusPersonalizado: this.statusPersonalizado,
      fechaInicio: this.getFormattedDate(this.date1),
      fechaFin: this.getFormattedDate(this.date2),
      selected: this.selected,
      comentario: this.comentario,
      codigo: this.frecuencia
    }
    this.tempDataService.setItem('objInversion',request);
    this.tempDataService.setItem('flow','prestamo');
    this.router.navigate(['registro/datoscliente']);
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
  this.frecuencia = 'D';
  if (cuota24) {
    this.nroCuota = cuota24.valor;
    this.selected = this.objValidationValues.cuotas.indexOf(cuota24) + 1; // Asegúrate de que el índice sea correcto
    this.setearFechaInicio();
    this.updateDate2();
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

  clicIntPersonalizado(){
    //this.interesPersonalizado = !this.interesPersonalizado;
    this.valueInteresPerso = null;
  }

  selectButton(buttonNumber: number, cuota:number, frecuencia: string): void {
    this.selected = buttonNumber; // Actualiza el botón seleccionado
    this.nroCuota = cuota;
    this.frecuencia = frecuencia;
    this.setearFechaInicio();
    this.updateDate2();
  }

  setearFechaInicio(){
    if (this.date1) {
      const newFecha = new Date(); 
      if(this.frecuencia=='D') newFecha.setDate(newFecha.getDate() + 1); 
      else if(this.frecuencia=='S') newFecha.setDate(newFecha.getDate() + 7);
      this.date1 = newFecha;
    }
  }

  updateDate2() {
    if (this.date1) {
      const newFecha2 = new Date(this.date1); 
      if(this.frecuencia=='D') newFecha2.setDate(newFecha2.getDate() + (this.nroCuota - 1 ) );
      else if(this.frecuencia=='S') newFecha2.setDate(newFecha2.getDate() + (
        this.nroCuota==1 ? 0 : ( this.nroCuota==4 ? 21 : (this.nroCuota==8 ? 49: 0 ) ) ) 
      );
      //newFecha2.setDate(newFecha2.getDate() + (this.nroCuota==4 ? 21 : this.nroCuota - 1 ) );
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

    get cuotasDiarias(): any[] {
    return this.objValidationValues?.cuotas?.filter((c : any) => c.codigo === 'D') || [];
    }

    get cuotasMensuales(): any[] {
    return this.objValidationValues?.cuotas?.filter((c : any) => c.codigo === 'S') || [];
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
          "valor": 18,
          "codigo": "D"
      },
      {
          "codCuota": "CUO2",
          "valor": 24,
          "codigo": "D"
      },
      {
          "codCuota": "CUO3",
          "valor": 30,
          "codigo": "D"
      }
  ]
}

}
