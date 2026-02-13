
import { CollectionReport } from '../../../interfaces/collection-report/collection-report';
import { ListEmptyNoneComponent } from '../../../components/resources/list-empty-none/list-empty-none.component';
import { GetInversionService } from '../../../core/services/inversion/get-inversion.service';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { catchError, delay, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { MessagePopUpComponent } from '../../modal/message-pop-up/message-pop-up.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { FormatNumberPipe } from '../../../core/pipes/format-number.pipe';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TwoDigitsPipe } from '../../../core/pipes/two-digits.pipe';
import { TempDataService } from '../../../core/services/temp-data.service';

@Component({
  selector: 'app-collection-report',
  standalone: true,
  imports: [TableModule, CommonModule, TabMenuModule, ListEmptyNoneComponent, LoadingComponent, SelectButtonModule,
    FormsModule, ToastModule, ConfirmDialogModule, CalendarModule, RouterModule, FormatNumberPipe, DatePicker, ButtonModule,
    TwoDigitsPipe, RouterLink
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './collection-report.component.html',
  styleUrl: './collection-report.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class CollectionReportComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  /* lista mayor a 5, diarios y Semanal */
  mostrarTodo: boolean = false;
  mostrarTodoS: boolean = false;

  /* lista - data */
  data: CollectionReport = {
    reportDiario: {
      lista: [],
      totalCuotas: 0
    },
    reportSemanal: [],
    amountCharged: 0
  };

  //Fecha a pagar
  date: Date = new Date();
  clienteSeleccionado = '';

  //confirm pagar
  valorCuota: number = 0;
  nroInversion: number = 0;
  IdInversion: number = 0;

  currency: string | null = null;
  pathSello: string | null = null;

  //Monto recaudado - modal
  descMontoRecaudado: string = 'Es el total del dinero que has registrado como pagado durante el día. Te muestra cuánto has cobrado hoy en tus préstamos.';
  descDiario: string = 'Diario muestra todas las cobranzas programadas para realizarse hoy.'+
                        '\nAquí encontrarás únicamente los pagos diarios que deben ser cobrados en la fecha actual, según la programación de cada inversión.';
  descSemanal: string = 'Semanal muestra las inversiones que tienen un cobro semanal.'+
                        '\nA diferencia de “Diario”, esta vista no depende del día exacto del cobro, sino del tipo de frecuencia con la que fue registrada la inversión.';

  constructor(
    private getInversionService: GetInversionService,
    public dialogService: DialogService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private tempDataService: TempDataService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadingComponent.show();
    }, 100);

    /* Cargar Logo y Sello */
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
    const selloGuardado = sessionStorage.getItem('pathSello');
    this.pathSello = selloGuardado && selloGuardado !== 'null' ? selloGuardado : 'public/logos/sello_ssimple.png';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getReportCollection();
    }, 150);
  }

  getReportCollection() {
    /* this.loadingComponent.show(); */
    this.getInversionService.getReportCollection().pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
    ).
      subscribe((resp: any) => {
        if (resp.codigoMessage == Constantes.STATUS_SUCCESS_RI) {
          if (resp.data.reportDiario != null) this.data.reportDiario = resp.data.reportDiario;
          if (resp.data.reportSemanal != null) this.data.reportSemanal = resp.data.reportSemanal;
          if (resp.data.amountCharged != null) this.data.amountCharged = resp.data.amountCharged;
        }
      });
  }

  pagarCuota(idInversion: number, cuotasPagadas: number, cliente: string, valorCuota: number, nroInversion: number, nroCuotas: number) {
    if (cuotasPagadas >= nroCuotas) return;
    this.clienteSeleccionado = cliente;
    var cuota = cuotasPagadas + 1;
    this.valorCuota = valorCuota;
    this.nroInversion = nroInversion;
    this.IdInversion = idInversion;
    this.confirm(cuota).then((result) => {
      if (result) {
        const fecha = this.formatearFecha(this.date);
        this.loadingComponent.show();
        this.getInversionService.pagarCuota(idInversion, cuota, fecha).pipe(
          // Manejamos errores de respuesta HTTP con catchError
          catchError((error) => {
            console.error('Error capturado:', error);
            this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
            return of(null);
          }))
          .subscribe((resp: any) => {
            if (resp.codigo == Constantes.STATUS_SUCCESS_RI) {
              this.messageService.add({
                severity: 'success', summary: 'Pagar cuota', detail: resp.descripcion, life: 1500
              });
            } else {
              this.messageService.add({
                severity: 'error', summary: 'Pagar cuota', detail: 'Error al pagar cuota.', life: 3000
              })
            }
            this.getReportCollection();
          });
      }
    });
  }

  confirm(nroCuota: number): Promise<boolean> {
    this.date = new Date();
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'cd',
        header: 'Pagar cuota',
        message: 'Cuota: ' + nroCuota + '',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  questionMondoRecaudado() {
    this.confirmMontoRecaudado().then((result) => {
      if (result) {

      }
    });
  }

  confirmMontoRecaudado(): Promise<boolean> {
    this.date = new Date();
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'montorecaudado',
        header: '¿Qué es el "Monto recaudado"?',
        message: this.descMontoRecaudado,
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  modalDiario(): Promise<boolean> {
    this.date = new Date();
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'diario',
        header: '¿Qué es “Diario”?',
        message: this.descDiario,
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  modalSemanal(): Promise<boolean> {
    this.date = new Date();
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'semanal',
        header: '¿Qué es Semanal?',
        message: this.descSemanal,
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  // Método para formatear la fecha
  private formatearFecha(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
  }
  // Método para alternar la visualización
  toggleMostrar() {
    this.mostrarTodo = !this.mostrarTodo;
  }
  toggleMostrarS() {
    this.mostrarTodoS = !this.mostrarTodoS;
  }


  /* COPIAR DATOS DEL REPORTE DIARIO */

  async onLongPress(n: number): Promise<void> {
    try {
      let texto = ''; // Título de la tabla
      let lista: any[] = [];
      if (n == 1) {
        texto = 'REPORTE DIARIO\n\n';
        lista = this.data.reportDiario.lista;
      }
      else {
        texto = 'REPORTE SEMANAL\n\n';
        lista = this.data.reportSemanal;
      }

      // Recorrer la lista y agregar filas a la tabla
      lista.forEach((item, index) => {
        const primerNombre = item.fullName.split(' ')[0]; // Primer nombre
        const segundoNombre = item.fullName.split(' ')[1] || ''; // Segundo nombre (si existe)

        let cuotaFormateado = item.ctasPagadas + "";
        if (item.ctasPagadas <= 9) cuotaFormateado = "0" + cuotaFormateado;

        const nombreCompleto = `${primerNombre} ${segundoNombre}`;
        index += 1;
        let indexFormateado = index + "";
        if (index <= 9) indexFormateado = "0" + indexFormateado;


        const fila = `${indexFormateado}. ${nombreCompleto} #${cuotaFormateado}`; // Genera la fila con el índice y nombre
        texto += fila + '\n';
      });

      texto += '-----------------------------------\n'; // Cerrar la tabla

      this.copyToClipboard(texto);
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

  copyToClipboard(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  // Función para formatear el texto de la celda y ajustarlo al tamaño deseado
  formatCell(cellContent: string, maxLength: number): string {
    // Asegura que el contenido de la celda tenga el tamaño especificado (maxLength)
    const padding = ' '.repeat(maxLength - cellContent.length); // Rellenar con espacios
    return cellContent + padding; // Devuelve el contenido de la celda con el tamaño correcto
  }
}

