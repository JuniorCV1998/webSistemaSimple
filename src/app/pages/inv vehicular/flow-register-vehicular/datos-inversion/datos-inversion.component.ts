import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DropdownModule } from 'primeng/dropdown';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of } from 'rxjs';
import { NroPlacaDirective } from '../../../../components/directives/nro-placa.directive';
import { Constantes } from '../../../../core/constant/Constantes';
import { InversionVehService } from '../../../../core/services/inversion-veh/inversion-veh.service';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-datos-inversion',
  standalone: true,
  imports: [CommonModule, TabMenuModule, FormsModule, ButtonModule, InputTextModule,
    DropdownModule, NroPlacaDirective, InputNumberModule, CalendarModule, FloatLabelModule,
    InputTextareaModule, ColorPickerModule, LoadingComponent, ToastModule, InputGroupModule, InputGroupAddonModule
  ],
  templateUrl: './datos-inversion.component.html',
  styleUrl: './datos-inversion.component.scss'
})

export default class DatosInversionComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  //inversion: any = {};
  mode: any = false;

  modalidad: any[] | undefined;
  selectedModalidad: any = 'SEMANAL';

  //fecha inicio y fin
  date1: Date = new Date();
  date2: Date | null = null;
  descripcion: string = '';

  /* Colores del vehiculo */
  color1: string = '#ff0000';
  color2: string = '#0004ff';

  // Datos de la persona
  persona: any = {}

  constructor(
    private tempDataService: TempDataService,
    private inversionVehService: InversionVehService,
    private dialogService: DialogService,
    private router: Router
  ){
    const cliente = this.tempDataService.hasItem('persona');
    if(cliente) this.persona = this.tempDataService.getItem<any>('persona');
    //this.tempDataService.removeItem('persona');
    
  }

  ngOnInit(): void{

    this.modalidad = [
      { name: 'SEMANAL', code: 'SM' },
      { name: 'MENSUAL', code: 'MS' }
    ];
    this.selectedModalidad = this.modalidad[0];
    this.setearFechaInicio();
  }

  ngAfterViewInit(): void{
    /* Setear datos del vehiculo */
    if(this.tempDataService.hasItem('inversionVeh')) {
      let temp = this.tempDataService.getItem<any>('inversionVeh');
      
      this.descripcion = temp.descripcion;
      if (this.modalidad && this.modalidad.length >= 2) this.selectedModalidad = temp.frecuencia === 'SEMANAL' ? this.modalidad[0] : this.modalidad[1];
      this.inversion.placa = temp.placa;
      this.inversion.montoDiario = temp.montoDiario;
      this.inversion.duracionPago = temp.duracionPago;
      this.date1 = new Date(temp.fechaInicio);
      this.date2 = new Date(temp.fechaFin);
      this.color1 = temp.color1;
      this.color2 = temp.color2;
    }

    /* Datos del cliente */
    if(!this.tempDataService.hasItem('flow')) this.router.navigate(['inicio']);
    else {
      if (Object.keys(this.persona).length === 0) {
        setTimeout(() => {
          this.showPersona("Será redirigido a la vista de Datos del Cliente.","Faltan datos del cliente");
        }, 100); 
      }
    }
    
  }
  
  functStatusClient(n: number){
    this.mode = n;
  }

  duracionTexto: string = '';

  setearFechaInicio(){
    if (this.date1) {
      const newFecha = new Date(); 
      if(this.inversion.duracionPago==null) newFecha.setDate(newFecha.getDate() + 1);
      else newFecha.setDate(newFecha.getDate() + this.inversion.duracionPago); 
      this.date1 = newFecha;
    }
  }

  updateDate2() {
    if (this.date1) {
      const newFecha2 = new Date(this.date1); 
      newFecha2.setMonth(newFecha2.getMonth() + (this.inversion.duracionPago==null?1:this.inversion.duracionPago));
      this.date2 = newFecha2;
    } else {
      this.date2 = null; // Limpiar date2 si date1 no está definido
    }
  }

    // Método para verificar si todos los campos obligatorios están llenos
    isFormValid(): boolean {
      return (
        this.inversion.placa.trim() !== '' &&
        this.inversion.montoDiario !== null  &&
        this.inversion.montoDiario >= 1  &&
        this.inversion.duracionPago !== null &&
        this.inversion.duracionPago >= 1 &&
        this.date1 != null &&
        this.date2 != null &&
        this.descripcion.trim() !== '' &&
        this.color1 !== '' &&
        this.color2 !== ''
      );
  }

  registerInvFalse(){
    if(!this.isFormValid()) return;
    
    let objNuevaInv: any = {
      idUsuario: this.persona.idUsuario==undefined?null:this.persona.idUsuario,
      descripcion: this.descripcion.trim(),
      frecuencia: this.selectedModalidad.name,
      placa: this.inversion.placa.trim(),
      montoDiario: this.inversion.montoDiario,
      duracionPago: this.inversion.duracionPago,
      fechaInicio: this.getFormattedDate(this.date1),
      fechaFin: this.getFormattedDate(this.date2),
      color1: this.color1,
      color2: this.color2,
      validado: false
    }
    if(this.persona.idUsuario==null) {
      objNuevaInv.persona = this.persona;
      objNuevaInv.persona.celular = objNuevaInv.persona.celular.replace(/ /g, "");
    }
    this.serviceFalseRegisterInversionVeh(objNuevaInv);
  }

  serviceFalseRegisterInversionVeh(requestBody: any){
        this.loadingComponent.show();
        this.inversionVehService.registerInversionVeh(requestBody).pipe(
          finalize(() => this.loadingComponent.hide()),
          catchError((error) => {
            if (error.status === 400) {
              this.show(error.error.descripcion, Constantes.MSG_H_400); // Mensaje para 400
            } else {
              this.show(Constantes.MSG_500, Constantes.MSG_H_500); // Mensaje para otros errores
            }
            // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
            return of(null);
          })
        ).subscribe((resp: any) => {
          if (resp) {
            const messageData = {
              severity: 'success',
              summary: '¡DATOS VALIDADOS!',
              detail: resp.descripcion,
              life: 3000
            };
            
            sessionStorage.setItem('lastMessage', JSON.stringify(messageData));
            this.tempDataService.setItem('inversionVeh', requestBody);
            this.tempDataService.setItem('response', resp.data);
            this.router.navigate(['vehicular/registro/confirmar']); 
          }
        });
    }

      show(message: string, header: string) {
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
          }
        });
    }

  showPersona(message: string, header: string) {
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
        this.router.navigate(['vehicular/registro/datoscliente']);
      }
    });
    //if(ref==null) this.router.navigate(['vehicular/registro/datoscliente']);
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
  

inversion: any = {
  idUsuario: null,
  descripcion: "",
  frecuencia: "",
  placa: "",
  montoDiario: null,
  duracionPago: null, // meses
  fechaInicio: "",
  fechaFin: "",
  color1: "",
  color2: "",
  validado: ""
}

}
