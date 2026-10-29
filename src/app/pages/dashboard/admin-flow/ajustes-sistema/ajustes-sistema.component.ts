import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { catchError, finalize, of, throwError } from 'rxjs';
import { PlanesMembresiaComponent } from '../../../../components/planes-membresia/planes-membresia.component';
import { Constantes } from '../../../../core/constant/Constantes';
import { AdminService } from '../../../../core/services/admin/admin.service';
import {
  AJUSTES_ACTUALES, AjustesPublicos, AjustesSistema, PLANES_SUGERIDOS, PlanMembresia, PlanPublico,
  aPublicos, duracionPlan, hoyLima, nombrePlan, soles
} from '../../../../core/utils/membresia';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { SystemService } from '../../../../core/services/system/system.service';

const MAX_ITEMS = 8;

@Component({
  selector: 'app-ajustes-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitch, DatePickerModule, ButtonModule, ToastModule, LoadingComponent, PlanesMembresiaComponent],
  providers: [MessageService],
  templateUrl: './ajustes-sistema.component.html',
  styleUrl: './ajustes-sistema.component.scss'
})
export default class AjustesSistemaComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  ajustes: AjustesSistema = this.copiar(AJUSTES_ACTUALES);
  private original = '';

  /** El backend aún no expone el servicio: se muestran los valores actuales de la app. */
  sinServicio = false;
  cargando = true;

  /* Textos que se están escribiendo para agregar a las listas */
  nuevoIncluye = '';
  nuevoBeneficio: Record<number, string | undefined> = {};
  /** Plan cuyo editor de beneficios está abierto. */
  planAbierto: number | null = null;

  /* Vista previa: se recalcula solo cuando cambian los ajustes */
  vistaPrevia: AjustesPublicos = aPublicos(this.ajustes);
  planPrevio: PlanPublico | null = null;
  private firmaPrevia = '';

  readonly maxItems = MAX_ITEMS;
  nombre = nombrePlan;
  duracion = duracionPlan;
  soles = soles;

  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private systemService: SystemService,
  ) { }

  ngOnInit() {
    this.adminService.getAjustesSistema().pipe(
      finalize(() => this.cargando = false),
      catchError(() => {
        this.sinServicio = true;
        return of(null);
      })
    ).subscribe((resp: any) => {
      if (resp) this.ajustes = this.normalizar(resp);
      this.original = JSON.stringify(this.ajustes);
      this.sincronizarFecha();
    });
  }

  ngDoCheck() {
    const firma = JSON.stringify(this.ajustes);
    if (firma === this.firmaPrevia) return;
    this.firmaPrevia = firma;
    this.vistaPrevia = aPublicos(this.ajustes);
    const elegido = this.planPrevio?.meses;
    this.planPrevio = this.vistaPrevia.planes.find(p => p.meses === elegido)
      ?? this.vistaPrevia.planes.find(p => p.destacado) ?? null;
  }

  /* ===== Estado del formulario ===== */

  get hayCambios(): boolean {
    return !this.cargando && this.firmaPrevia !== this.original;
  }

  get whatsappValido(): boolean {
    const n = this.ajustes.contacto.whatsappNumero;
    return this.ajustes.contacto.whatsappCodPais === '51' ? /^9\d{8}$/.test(n) : /^\d{6,15}$/.test(n);
  }

  get correoValido(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.ajustes.contacto.correo);
  }

  urlValida(url: string, opcional = false): boolean {
    if (!url) return opcional;
    return /^https:\/\/\S+\.\S+/.test(url);
  }

  get planesValidos(): boolean {
    const activos = this.ajustes.planes.filter(p => p.activo);
    return activos.length > 0 && activos.every(p => (p.precio ?? 0) > 0);
  }

  get ofertaValida(): boolean {
    const o = this.ajustes.oferta;
    if (!o.activa) return true;
    return (o.porcentaje ?? 0) >= 5 && (o.porcentaje ?? 0) <= 50 && !!o.fechaFin && o.fechaFin >= this.hoy;
  }

  get formularioValido(): boolean {
    return this.whatsappValido && this.correoValido && this.urlValida(this.ajustes.enlaces.urlPlayStore)
      && this.urlValida(this.ajustes.enlaces.urlAppStore, true) && this.planesValidos && this.ofertaValida;
  }

  get hoy(): string {
    return hoyLima();
  }

  /* ===== Fecha fin de la oferta: el datepicker trabaja con Date, los ajustes con yyyy-MM-dd ===== */

  fechaFin: Date | null = null;
  readonly minFechaFin = this.aFecha(hoyLima());

  onFechaFinChange(fecha: Date | null) {
    this.ajustes.oferta.fechaFin = fecha
      ? `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
      : '';
  }

  private sincronizarFecha() {
    this.fechaFin = this.aFecha(this.ajustes.oferta.fechaFin);
  }

  private aFecha(iso: string): Date | null {
    const [a, m, d] = (iso || '').split('-').map(Number);
    return a && m && d ? new Date(a, m - 1, d) : null;
  }

  /* ===== Contacto ===== */

  onNumeroInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '').slice(0, 15);
    if (input.value !== limpio) input.value = limpio;
    this.ajustes.contacto.whatsappNumero = limpio;
  }

  probarWhatsapp() {
    const c = this.ajustes.contacto;
    window.open(`https://wa.me/${c.whatsappCodPais}${c.whatsappNumero}?text=${encodeURIComponent('Prueba de contacto desde SSIMPLE PAY')}`, '_blank');
  }

  abrir(url: string) {
    if (this.urlValida(url)) window.open(url, '_blank');
  }

  /* ===== Listas (incluye / beneficios) ===== */

  agregar(lista: string[], texto: string): boolean {
    const limpio = texto.trim().replace(/\s+/g, ' ');
    if (!limpio || lista.length >= MAX_ITEMS || lista.some(i => i.toLowerCase() === limpio.toLowerCase())) return false;
    lista.push(limpio);
    return true;
  }

  agregarIncluye() {
    if (this.agregar(this.ajustes.incluye, this.nuevoIncluye)) this.nuevoIncluye = '';
  }

  agregarBeneficio(plan: PlanMembresia) {
    if (this.agregar(plan.beneficios, this.nuevoBeneficio[plan.meses] ?? '')) this.nuevoBeneficio[plan.meses] = '';
  }

  quitar(lista: string[], i: number) {
    lista.splice(i, 1);
  }

  alternarBeneficios(plan: PlanMembresia) {
    this.planAbierto = this.planAbierto === plan.meses ? null : plan.meses;
  }

  /* ===== Planes ===== */

  /** Precio del plan de 1 mes: referencia para calcular el ahorro de los demás. */
  get precioMensual(): number {
    return Number(this.ajustes.planes.find(p => p.meses === 1)?.precio) || 0;
  }

  porMes(plan: PlanMembresia): number {
    return (Number(plan.precio) || 0) / plan.meses;
  }

  ahorroPct(plan: PlanMembresia): number {
    if (plan.meses === 1 || !this.precioMensual || !plan.precio) return 0;
    return Math.round((1 - this.porMes(plan) / this.precioMensual) * 100);
  }

  marcarDestacado(plan: PlanMembresia) {
    const nuevo = !plan.destacado;
    this.ajustes.planes.forEach(p => p.destacado = false);
    plan.destacado = nuevo && plan.activo;
  }

  onActivoChange(plan: PlanMembresia) {
    if (!plan.activo) plan.destacado = false;
  }

  aplicarSugeridos() {
    this.ajustes.planes.forEach(p => {
      const s = PLANES_SUGERIDOS[p.meses];
      if (s) Object.assign(p, this.copiar(s));
    });
  }

  /* ===== Guardar ===== */

  guardar() {
    if (!this.formularioValido) return;

    if (this.sinServicio) {
      this.messageService.add({
        severity: 'info',
        summary: 'Aún no disponible',
        detail: 'El servicio para guardar estos ajustes está en desarrollo.',
        life: 3500
      });
      return;
    }

    this.loadingComponent.show();
    this.adminService.updateAjustesSistema(this.ajustes).pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError((error) => {
        this.messageService.add({
          severity: 'error',
          summary: Constantes.MSG_SERVICE_ERROR,
          detail: error.error?.descripcion ?? error.error?.message ?? Constantes.MSG_ERROR_SERVICIO,
          life: 3500
        });
        return throwError(() => error);
      })
    ).subscribe(() => {
      this.original = JSON.stringify(this.ajustes);
      this.systemService.refrescarAjustesPublicos();
      this.messageService.add({
        severity: 'success',
        summary: Constantes.MSG_SERVICE_UPDATE,
        detail: Constantes.MSG_SERVICE_DESC_UPDATE,
        life: 3000
      });
    });
  }

  descartar() {
    this.ajustes = JSON.parse(this.original);
    this.sincronizarFecha();
  }

  /* ===== Utilidades ===== */

  private copiar<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /** Completa con los valores actuales lo que el backend no envíe y ordena los planes por meses. */
  private normalizar(resp: Partial<AjustesSistema>): AjustesSistema {
    const base = this.copiar(AJUSTES_ACTUALES);
    const planes = (resp.planes?.length ? resp.planes : base.planes)
      .map(p => ({ ...p, precio: p.precio == null ? null : Number(p.precio), beneficios: p.beneficios ?? [] }))
      .sort((a, b) => a.meses - b.meses);
    return {
      contacto: { ...base.contacto, ...resp.contacto },
      enlaces: { ...base.enlaces, ...resp.enlaces },
      incluye: resp.incluye ?? base.incluye,
      planes,
      oferta: { ...base.oferta, ...resp.oferta },
    };
  }
}
