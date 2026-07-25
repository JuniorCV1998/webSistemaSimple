import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { NroCelularDirective } from '../../../components/directives/nro-celular.directive';
import { Constantes } from '../../../core/constant/Constantes';
import { GetInversionService } from '../../../core/services/inversion/get-inversion.service';
import { EstadoWhatsapp, RecordatorioWhatsappItem } from '../../../interfaces/recordatorio-whatsapp/recordatorio-whatsapp';
import { ListEmptyNoneComponent } from '../../../components/resources/list-empty-none/list-empty-none.component';
import { LoadingComponent } from '../../modal/loading/loading.component';

const QR_EXPIRA_SEGUNDOS = 45;
const POLLING_INTERVALO_MS = 4000;
const ESTADO_WATCH_INTERVALO_MS = 25000;
const MENSAJE_DEFECTO = 'Hola {nombre}, este es un recordatorio de tu pago de hoy con Sistema Simple Pay.';
const MENSAJE_MAX_LENGTH = 500;

@Component({
  selector: 'app-recordatorios-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, CalendarModule, TabViewModule, ToastModule,
    ToggleSwitch, ListEmptyNoneComponent, LoadingComponent, InputTextModule, NroCelularDirective, ConfirmDialogModule,
    TextareaModule, AccordionModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './recordatorios-whatsapp.component.html',
  styleUrl: './recordatorios-whatsapp.component.scss'
})
export default class RecordatoriosWhatsappComponent implements OnDestroy {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;
  listaDiario: RecordatorioWhatsappItem[] = [];
  listaSemanal: RecordatorioWhatsappItem[] = [];
  filtroTexto: string = '';

  get listaDiarioFiltrada(): RecordatorioWhatsappItem[] {
    return this.filtrarLista(this.listaDiario);
  }

  get listaSemanalFiltrada(): RecordatorioWhatsappItem[] {
    return this.filtrarLista(this.listaSemanal);
  }

  private filtrarLista(lista: RecordatorioWhatsappItem[]): RecordatorioWhatsappItem[] {
    const texto = this.filtroTexto.trim().toLowerCase();
    if (!texto) return lista;
    return lista.filter(item =>
      item.fullName.toLowerCase().includes(texto) || String(item.nroInversion).includes(texto)
    );
  }

  /* Vinculación de WhatsApp */
  estadoWhatsapp: EstadoWhatsapp = { vinculado: false, qrCode: null, pairingCode: null, numeroVinculado: null };
  vinculando: boolean = false;
  iniciandoVinculacion: boolean = false;
  desvinculando: boolean = false;
  segundosRestantesQr: number = 0;
  /** Número opcional que el inversor puede ingresar antes de vincular (solo tiene efecto la primera vez). */
  numeroParaVincular: string = '';
  private pollingHandle: any = null;
  private cuentaRegresivaHandle: any = null;
  private estadoWatchHandle: any = null;

  /* Hora de envío de los recordatorios */
  horaEnvio: string = '09:00';
  horaSeleccionada: Date = this.horaStringToDate('09:00');
  guardandoHora: boolean = false;

  get horaCambiada(): boolean {
    return this.dateToHoraString(this.horaSeleccionada) !== this.horaEnvio;
  }

  /* Mensaje personalizado del recordatorio */
  mensaje: string = MENSAJE_DEFECTO;
  mensajeEditado: string = MENSAJE_DEFECTO;
  guardandoMensaje: boolean = false;
  readonly mensajeMaxLength = MENSAJE_MAX_LENGTH;

  get mensajeCambiado(): boolean {
    return this.mensajeEditado.trim() !== this.mensaje;
  }

  private horaStringToDate(hora: string): Date {
    const [h, m] = hora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(h, m, 0, 0);
    return fecha;
  }

  private dateToHoraString(fecha: Date): string {
    const h = String(fecha.getHours()).padStart(2, '0');
    const m = String(fecha.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  /** "51921754924" -> "+51 921 754 924" (código de país de 2 dígitos + resto agrupado de a 3). */
  formatNumeroVinculado(numero: string | null): string {
    if (!numero) return '';
    const codigoPais = numero.slice(0, 2);
    const resto = numero.slice(2).replace(/(\d{3})(?=\d)/g, '$1 ');
    return `+${codigoPais} ${resto}`;
  }

  /** El backend espera el número completo con código de país (ej. "51921754924"), pero el
   *  input solo captura el número local peruano de 9 dígitos: se le antepone "51" aquí. */
  private numeroConCodigoPais(): string | undefined {
    const local = this.numeroParaVincular.replace(/\s+/g, '');
    return local ? `51${local}` : undefined;
  }

  constructor(
    private getInversionService: GetInversionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadingComponent.show();
    }, 100);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cargarPantallaInicial();
      this.iniciarMonitoreoEstadoWhatsapp();
    }, 150);
  }

  ngOnDestroy(): void {
    this.detenerPolling();
    if (this.estadoWatchHandle) clearInterval(this.estadoWatchHandle);
  }

  /** Carga en paralelo todo lo que necesita la pantalla y recién oculta el loading cuando las
   *  tres respuestas llegaron: antes, el loading se ocultaba apenas resolvía getRecordatoriosWhatsapp,
   *  dejando la tarjeta de WhatsApp (estado/config) "saltando" a su valor real después. */
  private cargarPantallaInicial(): void {
    forkJoin([
      this.getInversionService.getRecordatoriosWhatsapp().pipe(catchError(() => of(null))),
      this.getInversionService.getEstadoWhatsapp().pipe(catchError(() => of(null))),
      this.getInversionService.getConfiguracionWhatsapp().pipe(catchError(() => of(null)))
    ]).pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false;
      })
    ).subscribe(([recordatoriosResp, estadoResp, configResp]: any[]) => {
      const lista: RecordatorioWhatsappItem[] = (recordatoriosResp && recordatoriosResp.data) ? recordatoriosResp.data : [];
      this.listaDiario = lista.filter(item => item.tipoCobro === 'DIARIO');
      this.listaSemanal = lista.filter(item => item.tipoCobro === 'SEMANAL');

      if (estadoResp && estadoResp.data) this.estadoWhatsapp = estadoResp.data;

      const config = configResp && configResp.data;
      this.aplicarHora((config && config.horaEnvio) ? config.horaEnvio : this.horaEnvio);
      this.aplicarMensaje((config && config.mensaje) ? config.mensaje : this.mensaje);
    });
  }

  /** Activa/desactiva el envío automático de recordatorios para una inversión puntual. */
  onToggle(item: RecordatorioWhatsappItem): void {
    const activar = item.recordatorioActivo;
    this.loadingComponent.show();
    this.getInversionService.actualizarRecordatorioWhatsapp(item.idInversion, activar).pipe(
      finalize(() => this.loadingComponent.hide())
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Listo',
          detail: activar ? 'Recordatorio activado.' : 'Recordatorio desactivado.', life: 2000
        });
      },
      error: () => {
        item.recordatorioActivo = !activar; // Revertir: el servicio no confirmó el cambio
        this.messageService.add({
          severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
          detail: 'No se pudo actualizar el recordatorio.', life: 3000
        });
      }
    });
  }

  /* VINCULACIÓN DE WHATSAPP */

  private consultarEstadoWhatsapp(): void {
    this.getInversionService.getEstadoWhatsapp().pipe(
      catchError(() => of(null))
    ).subscribe((resp: any) => {
      if (resp && resp.data) this.estadoWhatsapp = resp.data;
    });
  }

  /**
   * Monitoreo pasivo mientras la pantalla está abierta: detecta si el inversor desvinculó
   * WhatsApp desde su celular (fuera de la app), sin esperar a que refresque o vuelva a entrar.
   * Se pausa mientras el flujo de vinculación (QR) ya está haciendo su propio polling rápido.
   */
  private iniciarMonitoreoEstadoWhatsapp(): void {
    if (this.estadoWatchHandle) clearInterval(this.estadoWatchHandle);
    this.estadoWatchHandle = setInterval(() => {
      if (this.vinculando) return;
      this.getInversionService.getEstadoWhatsapp().pipe(
        catchError(() => of(null))
      ).subscribe((resp: any) => {
        if (!resp || !resp.data) return;
        const estabaVinculado = this.estadoWhatsapp.vinculado;
        this.estadoWhatsapp = resp.data;
        if (estabaVinculado && !resp.data.vinculado) {
          this.messageService.add({
            severity: 'warn', summary: 'WhatsApp desvinculado',
            detail: 'Tu WhatsApp se desvinculó. Vincúlalo nuevamente para seguir enviando recordatorios.', life: 4500
          });
        }
      });
    }, ESTADO_WATCH_INTERVALO_MS);
  }

  vincularWhatsapp(): void {
    // "vinculando" recién se activa cuando llega la respuesta con el QR real: si se activaba
    // antes, el panel se mostraba de inmediato con el contador en 0 mientras esperaba el servicio.
    this.iniciandoVinculacion = true;
    this.loadingComponent.show();
    this.getInversionService.vincularWhatsapp(this.numeroConCodigoPais()).pipe(
      finalize(() => {
        this.iniciandoVinculacion = false;
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: (resp: any) => {
        if (!resp || !resp.data) {
          this.messageService.add({
            severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
            detail: 'No se pudo iniciar la vinculación con WhatsApp.', life: 3000
          });
          return;
        }

        this.estadoWhatsapp = resp.data;
        if (this.estadoWhatsapp.vinculado) {
          this.numeroParaVincular = '';
          this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'WhatsApp vinculado correctamente.', life: 2500 });
          return;
        }

        this.vinculando = true;
        // iniciarPolling() limpia ambos intervalos (polling + cuenta regresiva) antes de arrancar,
        // por eso debe ir primero: si se llamara después mataría la cuenta regresiva recién creada.
        this.iniciarPolling();
        this.iniciarCuentaRegresivaQr();
      },
      error: (error) => {
        // El botón "Vincular" no debería mostrarse si ya hay un WhatsApp vinculado, pero por si
        // acaso (dos pestañas, doble clic) el backend responde 400: re-sincroniza la pantalla con
        // el estado real para que deje de ofrecer "Vincular" y muestre el que ya está conectado.
        if (error.status === 400) {
          this.messageService.add({
            severity: 'warn', summary: 'WhatsApp ya vinculado',
            detail: error.error?.descripcion || 'Ya tienes un WhatsApp vinculado.', life: 4000
          });
          this.consultarEstadoWhatsapp();
          return;
        }
        this.messageService.add({
          severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
          detail: 'No se pudo iniciar la vinculación con WhatsApp.', life: 3000
        });
      }
    });
  }

  confirmDesvincular(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'desvincular_whatsapp',
        header: 'Desvincular WhatsApp',
        message: '¿Está seguro que desea desvincular WhatsApp?',
        accept: () => { resolve(true); },
        reject: () => { resolve(false); }
      });
    });
  }

  async desvincularWhatsapp(): Promise<void> {
    const confirmado = await this.confirmDesvincular();
    if (!confirmado) return;

    this.desvinculando = true;
    this.loadingComponent.show();
    this.getInversionService.desvincularWhatsapp().pipe(
      finalize(() => {
        this.desvinculando = false;
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: () => {
        this.estadoWhatsapp = { vinculado: false, qrCode: null, pairingCode: null, numeroVinculado: null };
        this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'WhatsApp desvinculado.', life: 2500 });
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
          detail: 'No se pudo desvincular WhatsApp.', life: 3000
        });
      }
    });
  }

  private iniciarPolling(): void {
    this.detenerPolling();
    this.pollingHandle = setInterval(() => {
      this.getInversionService.getEstadoWhatsapp().pipe(
        catchError(() => of(null))
      ).subscribe((resp: any) => {
        if (resp && resp.data && resp.data.vinculado) {
          this.estadoWhatsapp = resp.data;
          this.vinculando = false;
          this.numeroParaVincular = '';
          this.detenerPolling();
          this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'WhatsApp vinculado correctamente.', life: 2500 });
        }
      });
    }, POLLING_INTERVALO_MS);
  }

  private iniciarCuentaRegresivaQr(): void {
    this.segundosRestantesQr = QR_EXPIRA_SEGUNDOS;
    clearInterval(this.cuentaRegresivaHandle);
    this.cuentaRegresivaHandle = setInterval(() => {
      this.segundosRestantesQr--;
      if (this.segundosRestantesQr <= 0) {
        this.detenerPolling();
        this.estadoWhatsapp.qrCode = null;
        this.estadoWhatsapp.pairingCode = null;
        this.vinculando = false;
        this.messageService.add({
          severity: 'warn', summary: 'Código expirado',
          detail: 'El código expiró. Genera uno nuevo para vincular tu WhatsApp.', life: 3500
        });
      }
    }, 1000);
  }

  /**
   * El QR de vinculación no se puede escanear con el mismo celular que lo muestra en pantalla.
   * En vez de compartir un link a la app (que exigiría loguearse de nuevo en otro dispositivo
   * y el QR expira en 45s, no da tiempo), se comparte/descarga la IMAGEN del QR directamente:
   * así se puede abrir de inmediato en otra pantalla sin volver a iniciar sesión.
   */
  async compartirEnlace(): Promise<void> {
    const qr = this.estadoWhatsapp.qrCode;
    if (!qr) return;

    try {
      const blob = await (await fetch(qr)).blob();
      const file = new File([blob], 'whatsapp-qr.png', { type: blob.type || 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'Código QR de WhatsApp', files: [file] });
        return;
      }
    } catch (err) {
      // El usuario canceló el share sheet o el navegador no soporta compartir archivos: se cae al descargar.
    }

    this.descargarQr(qr);
  }

  private descargarQr(qr: string): void {
    try {
      const link = document.createElement('a');
      link.href = qr;
      link.download = 'whatsapp-qr.png';
      link.click();
      this.messageService.add({
        severity: 'success', summary: 'Código QR descargado',
        detail: 'Ábrelo en otro dispositivo (PC, tablet u otro celular) y escanéalo con la cámara de WhatsApp.',
        life: 4000
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
        detail: 'No se pudo descargar el código QR.', life: 3000
      });
    }
  }

  /** Copia el pairingCode: se ingresa directamente en WhatsApp → Ajustes → Dispositivos vinculados,
   *  en el MISMO celular que se está vinculando (no requiere un segundo dispositivo, a diferencia del QR). */
  async copiarPairingCode(): Promise<void> {
    const code = this.estadoWhatsapp.pairingCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      this.messageService.add({
        severity: 'success', summary: 'Código copiado',
        detail: 'Pégalo en WhatsApp → Ajustes → Dispositivos vinculados → Vincular con número de teléfono.',
        life: 4000
      });
    } catch (err) {
      this.messageService.add({
        severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
        detail: 'No se pudo copiar el código.', life: 3000
      });
    }
  }

  private detenerPolling(): void {
    if (this.pollingHandle) {
      clearInterval(this.pollingHandle);
      this.pollingHandle = null;
    }
    if (this.cuentaRegresivaHandle) {
      clearInterval(this.cuentaRegresivaHandle);
      this.cuentaRegresivaHandle = null;
    }
  }

  /* HORA DE ENVÍO Y MENSAJE PERSONALIZADO */

  private aplicarHora(hora: string): void {
    this.horaEnvio = hora;
    this.horaSeleccionada = this.horaStringToDate(hora);
  }

  guardarHoraEnvio(): void {
    if (!this.horaCambiada) return;
    const nuevaHora = this.dateToHoraString(this.horaSeleccionada);
    this.guardandoHora = true;
    this.loadingComponent.show();
    this.getInversionService.actualizarHoraEnvioWhatsapp(nuevaHora).pipe(
      finalize(() => {
        this.guardandoHora = false;
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: () => {
        this.horaEnvio = nuevaHora;
        this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'Hora de envío actualizada.', life: 2000 });
      },
      error: () => {
        this.aplicarHora(this.horaEnvio);
        this.messageService.add({
          severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
          detail: 'No se pudo actualizar la hora de envío.', life: 3000
        });
      }
    });
  }

  private aplicarMensaje(mensaje: string): void {
    this.mensaje = mensaje;
    this.mensajeEditado = mensaje;
  }

  guardarMensaje(): void {
    const nuevoMensaje = this.mensajeEditado.trim();
    if (!this.mensajeCambiado || !nuevoMensaje) return;
    this.guardandoMensaje = true;
    this.loadingComponent.show();
    this.getInversionService.actualizarMensajeWhatsapp(nuevoMensaje).pipe(
      finalize(() => {
        this.guardandoMensaje = false;
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: () => {
        this.aplicarMensaje(nuevoMensaje);
        this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'Mensaje actualizado.', life: 2000 });
      },
      error: () => {
        this.mensajeEditado = this.mensaje;
        this.messageService.add({
          severity: 'error', summary: Constantes.MSG_SERVICE_ERROR,
          detail: 'No se pudo actualizar el mensaje.', life: 3000
        });
      }
    });
  }
}
