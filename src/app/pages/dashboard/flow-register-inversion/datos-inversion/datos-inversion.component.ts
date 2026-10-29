import { Component, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { Subject, Subscription, catchError, debounceTime, finalize, of, switchMap } from 'rxjs';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { DatePicker } from 'primeng/datepicker';
import { CerrarOverlayAlNavegarDirective } from '../../../../components/directives/cerrar-overlay-al-navegar.directive';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { TextareaModule } from 'primeng/textarea';
import { TIPO_INTERES, TipoInteres, permiteProgresivo } from '../../../../core/utils/tipo-interes';
import { hapticSeleccion } from '../../../../core/ionic/native';
import { FlowStepsComponent } from '../../../../components/resources/flow-steps/flow-steps.component';
import { PASOS_PRESTAMO } from '../../../../core/utils/flujos';

interface OpcionCuota {
  codCuota: string;
  valor: number;
  codigo: string; // 'D' diario | 'S' semanal
}

@Component({
  selector: 'app-datos-inversion',
  standalone: true,
  imports: [ButtonModule, InputTextModule, FormsModule, InputNumberModule, LoadingComponent, DatePicker, CerrarOverlayAlNavegarDirective,
    CommonModule, FormatNumberPipe, TextareaModule, FlowStepsComponent],
  templateUrl: './datos-inversion.component.html',
  styleUrl: './datos-inversion.component.scss'
})
export default class DatosInversionComponent implements OnDestroy {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  readonly TIPO_INTERES = TIPO_INTERES;
  readonly PASOS_PRESTAMO = PASOS_PRESTAMO;

  valueMonto: number | null = null;

  // Plan de cuotas
  frecuencia: string = 'D';
  nroCuota: number = 0;

  // Interés
  valueInteres: number | null = 20;
  tipoInteres: TipoInteres = TIPO_INTERES.SIMPLE;
  readonly interesesRapidos = [10, 15, 20, 25, 30];

  // Simulación (se recalcula sola al cambiar monto, cuotas o interés)
  valorCuota: number | null = null;
  simulando = false;
  errorSimulacion = false;
  private simular$ = new Subject<void>();
  private simulacionSub: Subscription;

  // Fechas
  date1: Date = new Date();
  date2: Date | null = null;

  comentario: string = '';

  currency: string | null = null;

  /** Si se volvió desde el paso siguiente, no se pisa la fecha de inicio que eligió el usuario. */
  private restaurado = false;

  constructor(
    private router: Router,
    private getInversionService: GetInversionService,
    private tempDataService: TempDataService
  ) {
    this.simulacionSub = this.simular$.pipe(
      debounceTime(450),
      switchMap(() => {
        if (!this.isFormValid()) {
          this.simulando = false;
          return of(null);
        }
        this.simulando = true;
        this.errorSimulacion = false;
        return this.getInversionService.sendSimulation({
          monto: this.valueMonto,
          cuotas: this.nroCuota,
          interes: this.valueInteres,
          tipoInteres: this.tipoInteres
        }).pipe(
          catchError(() => {
            this.errorSimulacion = true;
            return of(null);
          }),
          finalize(() => this.simulando = false)
        );
      })
    ).subscribe((resp: any) => {
      this.valorCuota = resp ? resp.valorCuota : null;
    });
  }

  ngOnInit() {
    if (this.tempDataService.hasItem('objInversion')) {
      const objnew = this.tempDataService.getItem<any>('objInversion');
      this.valueMonto = objnew.monto;
      this.valueInteres = objnew.interes ?? 20;
      this.tipoInteres = objnew.tipoInteres === TIPO_INTERES.PROGRESIVO ? TIPO_INTERES.PROGRESIVO : TIPO_INTERES.SIMPLE;
      this.comentario = objnew.comentario || '';
      if (objnew.codigo && objnew.nroCuotas) {
        this.frecuencia = objnew.codigo;
        this.nroCuota = objnew.nroCuotas;
        this.date1 = objnew.fechaInicio ? new Date(objnew.fechaInicio.replace(' ', 'T')) : this.fechaInicioPorDefecto();
        this.updateDate2();
        if (!this.progresivoDisponible) this.tipoInteres = TIPO_INTERES.SIMPLE;
        this.restaurado = true;
      }
    }
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }

  ngAfterViewInit(): void {
    this.getValidationValues();
  }

  ngOnDestroy(): void {
    this.simulacionSub.unsubscribe();
  }

  validarDatosInversion() {
    if (!this.isFormValid()) return;
    const request = {
      monto: this.valueMonto,
      nroCuotas: this.nroCuota,
      interes: this.valueInteres,
      tipoInteres: this.tipoInteres,
      fechaInicio: this.getFormattedDate(this.date1),
      fechaFin: this.getFormattedDate(this.date2),
      comentario: this.comentario,
      codigo: this.frecuencia
    }
    this.tempDataService.setItem('objInversion', request);
    this.tempDataService.setItem('flow', 'prestamo');
    this.router.navigate(['registro/datoscliente']);
  }

  getValidationValues() {
    this.loadingComponent.show();
    this.getInversionService.getValidationValues().pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError(() => of(null))
    ).subscribe((resp: any) => {
      if (resp) this.objValidationValues = resp;
      this.seleccionInicial();
      this.simular();
    });
  }

  /** Por defecto: 24 cuotas diarias (o la primera opción disponible). */
  private seleccionInicial() {
    const existe = this.opciones.some(c => c.codigo === this.frecuencia && c.valor === this.nroCuota);
    if (this.restaurado && existe) return;
    const opcion = this.cuotasDiarias.find(c => c.valor === 24) ?? this.cuotasDiarias[0] ?? this.opciones[0];
    if (opcion) this.seleccionarCuota(opcion, false);
  }

  /* ===== Monto ===== */

  get montoMin(): number { return this.objValidationValues?.montoLimit?.montoMin ?? 1; }
  get montoMax(): number { return this.objValidationValues?.montoLimit?.montoMax ?? 10000; }

  get montosRapidos(): number[] {
    return [100, 200, 500, 1000].filter(m => m >= this.montoMin && m <= this.montoMax);
  }

  elegirMonto(monto: number) {
    hapticSeleccion();
    this.valueMonto = monto;
    this.simular();
  }

  get montoFueraDeRango(): boolean {
    return this.valueMonto !== null && (this.valueMonto < this.montoMin || this.valueMonto > this.montoMax);
  }

  /* ===== Cuotas ===== */

  get opciones(): OpcionCuota[] { return this.objValidationValues?.cuotas || []; }
  get cuotasDiarias(): OpcionCuota[] { return this.opciones.filter(c => c.codigo === 'D'); }
  get cuotasSemanales(): OpcionCuota[] { return this.opciones.filter(c => c.codigo === 'S'); }

  get cuotasVisibles(): OpcionCuota[] {
    return this.frecuencia === 'S' ? this.cuotasSemanales : this.cuotasDiarias;
  }

  cambiarFrecuencia(frecuencia: string) {
    if (this.frecuencia === frecuencia) return;
    hapticSeleccion();
    const lista = frecuencia === 'S' ? this.cuotasSemanales : this.cuotasDiarias;
    if (lista.length) this.seleccionarCuota(lista[0]);
  }

  esCuotaActiva(c: OpcionCuota): boolean {
    return this.frecuencia === c.codigo && this.nroCuota === c.valor;
  }

  seleccionarCuota(c: OpcionCuota, haptic = true) {
    if (haptic) hapticSeleccion();
    this.frecuencia = c.codigo;
    this.nroCuota = c.valor;
    // Progresivo solo con 1, 4 u 8 cuotas: si la nueva opción no lo permite, vuelve a simple
    if (!this.progresivoDisponible) this.tipoInteres = TIPO_INTERES.SIMPLE;
    this.date1 = this.fechaInicioPorDefecto();
    this.updateDate2();
    this.simular();
  }

  unidadCuota(c: OpcionCuota): string {
    if (c.codigo === 'S') return c.valor === 1 ? 'semana' : 'semanas';
    return c.valor === 1 ? 'día' : 'días';
  }

  get etiquetaCuota(): string {
    return this.frecuencia === 'S' ? 'Cuota semanal' : 'Cuota diaria';
  }

  /* ===== Interés ===== */

  get interesMin(): number { return this.objValidationValues?.interesLimit?.interesMin ?? 1; }
  get interesMax(): number { return this.objValidationValues?.interesLimit?.interesMax ?? 2000; }

  elegirInteres(valor: number) {
    hapticSeleccion();
    this.valueInteres = valor;
    this.simular();
  }

  get interesFueraDeRango(): boolean {
    return this.valueInteres !== null && (this.valueInteres < this.interesMin || this.valueInteres > this.interesMax);
  }

  get progresivoDisponible(): boolean {
    return permiteProgresivo(this.nroCuota);
  }

  cambiarTipoInteres(tipo: TipoInteres) {
    if (this.tipoInteres === tipo) return;
    if (tipo === TIPO_INTERES.PROGRESIVO && !this.progresivoDisponible) return;
    hapticSeleccion();
    this.tipoInteres = tipo;
    this.simular();
  }

  /* ===== Simulación ===== */

  simular() {
    this.valorCuota = null;
    this.errorSimulacion = false;
    this.simulando = this.isFormValid();
    this.simular$.next();
  }

  get totalACobrar(): number | null {
    return this.valorCuota == null ? null : Math.round(this.valorCuota * this.nroCuota * 100) / 100;
  }

  get ganancia(): number | null {
    const total = this.totalACobrar;
    return total == null || this.valueMonto == null ? null : Math.round((total - this.valueMonto) * 100) / 100;
  }

  /* ===== Fechas ===== */

  private fechaInicioPorDefecto(): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + (this.frecuencia === 'S' ? 7 : 1));
    return fecha;
  }

  updateDate2() {
    if (!this.date1 || !this.nroCuota) {
      this.date2 = null;
      return;
    }
    const fin = new Date(this.date1);
    const pasoDias = this.frecuencia === 'S' ? 7 : 1;
    fin.setDate(fin.getDate() + (this.nroCuota - 1) * pasoDias);
    this.date2 = fin;
  }

  fechaCorta(date: Date | null): string {
    if (!date) return '-';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  /* ===== Validación ===== */

  isFormValid(): boolean {
    return (
      this.valueMonto !== null && this.valueMonto > 0 && !this.montoFueraDeRango &&
      !!this.nroCuota &&
      this.valueInteres !== null && this.valueInteres > 0 && !this.interesFueraDeRango
    );
  }

  getFormattedDate(date: any): string | null {
    if (!date) {
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
      { "codCuota": "CUO1", "valor": 18, "codigo": "D" },
      { "codCuota": "CUO2", "valor": 24, "codigo": "D" },
      { "codCuota": "CUO3", "valor": 30, "codigo": "D" }
    ]
  }

}
