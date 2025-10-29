import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, delay, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { LoginService } from '../../../../core/services/auth/login/login.service';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CarouselModule } from 'primeng/carousel';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Message, MessageModule } from 'primeng/message';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { TwoDigitsPipe } from '../../../../core/pipes/two-digits.pipe';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-inversion-detail',
  standalone: true,
  imports: [ButtonModule, CommonModule, ToastModule, TabMenuModule, ConfirmDialogModule, CalendarModule, FormsModule,
    LoadingComponent, CarouselModule, FloatLabelModule, TextareaModule, CheckboxModule, FormatNumberPipe,
    TwoDigitsPipe, DatePicker, Message, RouterLink
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './inversion-detail.component.html',
  styleUrl: './inversion-detail.component.scss'
})
export default class InversionDetailComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  //cod de Operacion
  messageCopiarCodOperacion: string = "Toca para copiar";

  idInversion: number | null = null;
  //Mostrar clave usuario
  mostrar: boolean = false;
  copy: boolean = false;
  //inversion detail
  nroCuotas: number = 24;
  nroCuotasPendientes = 0;
  //Fecha a pagar
  date: Date = new Date();
  // cod perfil
  codPerfil: string = '';

  //lista de productos disponibles para el usuario
  products: any = [];

  //Renovacion
  //fecha inicio y fin
  date1: Date = new Date();
  date1Show: string = '';
  date2: Date | null = null;
  date2Show: string = '';
  showComent: number | null = null;
  txtComentario: string = "";
  valorCuota: number = 0;

  currency: string | null = null;
  pathLogo: string | null = null;
  pathSello: string | null = null;
  imageLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private getInversionService: GetInversionService,
    public dialogService: DialogService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private loginService: LoginService,
    private adminService: AdminService,
    private tempDataService: TempDataService,
  ) {
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      this.codPerfil = decodedToken.codPerfil;
    }

  }

  numero: number = 0;

  ngOnInit(): void {
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversion');
      this.idInversion = id ? +id : null; // Convertir a número si existe
    });
    /* detall de inversion */
    setTimeout(() => {
      this.loadingComponent.show();
      this.getInversionesDetail();

    });

    /* Cargar Logo y Sello */
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
    const selloGuardado = sessionStorage.getItem('pathSello');
    this.pathSello = selloGuardado && selloGuardado !== 'null' ? selloGuardado : 'public/logos/sello_ssimple.png';
  }

  ngAfterViewInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    /* const totalCuotas = this.nroCuotas; // Puedes poner 18, 30, etc.
    this.cuotas = Array.from({ length: totalCuotas }, (_, i) => i + 1);
    this.cuotasEnFilas = this.chunkArray(this.cuotas, 4); */
  }

  getInversionesDetail() {
    /* this.loadingComponent.show(); */
    this.getInversionService.getInversionesDetail(this.idInversion === null ? 0 : this.idInversion).pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
      // Manejamos errores de respuesta HTTP con catchError
      catchError((error) => {
        // Aquí manejamos los diferentes errores HTTP (400, 403, 500, etc.)
        if (error.status === 403) {
          this.show(Constantes.MSG_H_403, 'Sin privilegios para esta acción.'); // Mensaje para 403
        } else {
          this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
        }
        // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
        return of(null);
      })
    ).
      subscribe((resp: any) => {
        if (resp.codigoMessage == Constantes.STATUS_SUCCESS_RI && resp.totalRecord == 1) {
          this.objInvDetail = resp.data;
          this.nroCuotas = resp.data.nroCuotas;
        }
      }

      );
  }

  show(header: string, message: string) {
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
        // Navegamos a la ruta deseada al aceptar
        this.router.navigate(['/inicio']);
      }
    });
  }

  pagarCuota(cuota: number) {
    if (this.codPerfil === Constantes.PERFIL_CLI) return;
    else if (this.codPerfil === Constantes.PERFIL_ADM) return;
    this.confirmCuota(cuota).then((result) => {
      if (result) {
        const fecha = this.formatearFecha(this.date) ?? '';
        this.loadingComponent.show();
        this.getInversionService.pagarCuota(this.idInversion === null ? 0 : this.idInversion, cuota, fecha).pipe(
          // Manejamos errores de respuesta HTTP con catchError
          catchError((error) => {
            // Aquí manejamos los diferentes errores HTTP (400, 403, 500, etc.)
            if (error.status === 403) {
              this.show(Constantes.MSG_H_403, 'Sin privilegios para esta acción.'); // Mensaje para 403
            } else {
              this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
            }
            // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
            return of(null);
          }))
          .subscribe((resp: any) => {
            if (resp.codigo == Constantes.STATUS_SUCCESS_RI) {
              this.messageService.add({
                severity: 'success', summary: 'Pagar cuota', detail: resp.descripcion, life: 3000
              });
            } else {
              this.messageService.add({
                severity: 'error', summary: 'Pagar cuota', detail: 'Error al pagar cuota.', life: 3000
              })
            }
            this.getInversionesDetail();
          });
      }
    });
  }

  confirmCuota(nroCuota: number): Promise<boolean> {
    this.date = new Date();
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'cdpago',
        header: 'Pagar cuota',
        message: 'Confirme la fecha de pago de la cuota número ' + nroCuota + '.',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  renovacion() {
    if (this.codPerfil === 'CLI') return;
    this.valorCuota = 0;
    const ctaDesde = this.objInvDetail.ctasPagadas + 1;
    const ctaHasta = this.objInvDetail.nroCuotas;
    this.setearFechaInicio();
    this.updateDate2();

    if (!this.confirmRenovacion(ctaDesde, ctaHasta)) return;
    this.confirmRenovacion(ctaDesde, ctaHasta).then((result) => {
      if (result) {
        this.renovarInversionService(false);
        /* Confirmar datos de renovación */
        this.confirmRenovacion_ok().then((result) => {
          if (result) this.renovarInversionService(true);
        });
      }
    });
  }

  renovarInversionService(validado: boolean) {
    if (!this.showComent) this.txtComentario = '';
    const objRenewInv = {
      idInversion: this.objInvDetail.idInversion,
      ctaDesde: this.objInvDetail.ctasPagadas + 1,
      ctaHasta: this.objInvDetail.nroCuotas,
      fecha: this.formatearFecha(this.date),
      obj:
      {
        fkUsuario: this.objInvDetail.idUsuario,
        monto: this.objInvDetail.monto,
        nroCuotas: this.objInvDetail.nroCuotas,
        interes: this.objInvDetail.interes,
        comentario: this.txtComentario,
        fechaInicio: this.formatearFecha(this.date1),
        fechaFin: this.date2 ? this.formatearFecha(this.date2) : null,
        validado: validado // 'false' -> En la pantalla 1, 'true' -> En la pantalla 2 
        // false o true, Se obtendra datos del usuario a nivel de front
      }
    }
    this.loadingComponent.show();
    this.getInversionService.renewInversion(objRenewInv).pipe(
      finalize(() => this.loadingComponent.hide()),
      // Manejamos errores de respuesta HTTP con catchError
      catchError((error) => {
        if (error.status === 400) { // Verificar código HTTP 400
          this.messageService.add({
            severity: 'warn',
            summary: 'Error en la solicitud',
            detail: error.error?.descripcion || 'Solicitud incorrecta',
            life: 3000
          });
        } else {
          this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Para otros errores
        }
        return of(null);
      }))
      .subscribe((resp: any) => {
        if (resp.codigo === Constantes.CODIGO_STATUS_202 || resp.codigo === Constantes.STATUS_SUCCESS_RI) {
          this.valorCuota = resp.data.valorCuota;
          this.date1Show = resp.data.fechaInicio;
          this.date2Show = resp.data.fechaFin;
          this.messageService.add({
            severity: 'success', summary: 'Renovar préstamo', detail: resp.descripcion, life: 3000
          });
          if (validado) {
            sessionStorage.setItem('confetti', JSON.stringify(true));
            this.router.navigate(['registrar/inversiondetalle'], { queryParams: { "idInversion": resp.data } })
          }
        } else {
          this.messageService.add({
            severity: 'warn', summary: 'Renovar préstamo', detail: resp.descripcion, life: 3000
          })
        }
      });
  }

  confirmRenovacion(ctaDesde: number, ctaHasta: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'cdrenovacion',
        header: 'Renovar préstamo',
        message: 'Confirme la fecha de pago de la cuota número ' + '.',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  confirmRenovacion_ok(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'cdrenovacion_ok',
        header: 'Confirmar renovación',
        message: 'Confirme la fecha de pago de la cuota número ' + '.',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          this.renovacion(); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  eliminarInversion() {
    if (this.codPerfil === Constantes.PERFIL_ADM) return;
    this.confirmEliminarInv().then((result) => {
      if (result) {
        this.loadingComponent.show();
        this.adminService.deleteInversion(this.objInvDetail.codOperacion).pipe(
          finalize(() => {
            this.loadingComponent.hide();
          }),
          // Manejamos errores de respuesta HTTP con catchError
          catchError((error) => {
            // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
            if (error.status === 400) this.show(Constantes.MSG_400, Constantes.MSG_H_400); // Mensaje para 400
            else if (error.status === 403) this.show(error.error.descripcion, Constantes.MSG_H_403);
            else this.show(Constantes.MSG_500, Constantes.MSG_H_500); // Mensaje para otros errores
            // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
            return of(null);
          })
        ).
          subscribe((resp: any) => {

            this.tempDataService.setItem('delete_inversion', true);
            window.history.back();
          }
          );
      }
    });

  }

  confirmEliminarInv(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'delete_inv',
        header: 'Eliminar inversión',
        message: '¿Está seguro que desea eliminar esta inversión?',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  confirmEliminarInvAdm(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'delete_inv_adm',
        header: 'Eliminar inversión',
        message: '¿Está seguro que desea eliminar esta inversión?',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  confirm_cli() {
    this.confirmationService.confirm({
      key: 'reno_cli',
      header: 'FELICIDADES',
      message: '¡Tu préstamo está listo para renovación!',
      accept: () => {

      }
    });
  }

  getRango(inicio: number, fin: number): number[] {
    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  updateDate2() {
    if (this.date1) {
      const newFecha2 = new Date(this.date1);
      newFecha2.setDate(newFecha2.getDate() + (this.objInvDetail.nroCuotas == 4 ? 21 : this.objInvDetail.nroCuotas - 1));
      this.date2 = newFecha2;
    } else {
      this.date2 = null; // Limpiar date2 si date1 no está definido
    }
  }

  setearFechaInicio() {
    if (this.date1) {
      const newFecha = new Date();
      if (this.objInvDetail.nroCuotas == 4) {
        newFecha.setDate(newFecha.getDate() + 7);
      }
      else newFecha.setDate(newFecha.getDate() + 1);
      this.date1 = newFecha;
    }
  }

  focusTextArea(event: any) {
    setTimeout(() => {
      event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }

  objInvDetail: any = {
    "idInversion": 0,
    "persona": {
      "idPersona": null,
      "nombres": "",
      "apellidoPaterno": "",
      "apellidoMaterno": "",
      "celular": "",
      "direccion": ""
    },
    "monto": 0,
    "nroCuotas": 0,
    "interes": 0,
    "valorCuota": 0,
    "fechaRegistro": "",
    "fechaInicio": "",
    "fechaFin": "",
    "credenciales": {
      "correo": "",
      "contrasena": ""
    },
    "comentario": "",
    "frecuenciaPago": "",
    "renovacion": 'N',
    "ctasPagadas": 0,
    "idUsuario": null
  }

  async copyCodigoOperacion(codAprobacion: string): Promise<void> {
    try {

      // Uso de la función
      var texto = "Se solicita la eliminación de la inversión con código de aprobación " + codAprobacion + ". Favor de proceder."
      this.messageCopiarCodOperacion = "¡Copiado!";
      setTimeout(() => {
        this.messageCopiarCodOperacion = "Toca para copiar";     // vuelve al original
      }, 3000); // 3 segundos
      this.copyToClipboard(texto);
    } catch (err) {
      // Manejar el error si la operación de copia falla
      this.messageService.add({
        severity: 'error',
        summary: 'Copiar',
        detail: 'Error al copiar al portapapeles.',
        life: 3000
      });
    }
  }

  // Método para formatear la fecha
  private formatearFecha(date: Date): string | null {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  async copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Texto copiado al portapapeles');
  } catch (err) {
    console.error('Error al copiar el texto: ', err);
  }
}

  formatNumberEspaciado(numero: string): string {
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  getFechaSinAnio(fechaStr: string): string {
    if (!fechaStr) return '';
    return fechaStr.split(' ')[0] + ' ' + fechaStr.split(' ')[2]; // "24 de abr. 2025" → "24 abr."
  }

  /* nueva tabla dinamica*/
  getCuotasEnFilas(): any[][] {
    const cuotas = this.objInvDetail.frecuenciaPago.fechasPagos;
    const filas = [];
    for (let i = 0; i < cuotas.length; i += 4) {
      const fila = [];
      for (let j = i; j < i + 4 && j < cuotas.length; j++) {
        fila.push({ ...cuotas[j], globalIndex: j }); // ← Agregamos el índice real
      }
      filas.push(fila);
    }
    return filas;
  }

  /* toast */
  mostrarFechaPagar(fecha: string) {
    this.messageService.add({ severity: 'contrast', summary: 'Fecha a pagar', detail: fecha });
  }

  trackByFila(index: number, fila: any): any {
    return index; // o algún ID si lo tienes
  }

  trackByObj(index: number, obj: any): any {
    return obj.id || index;
  }


}
