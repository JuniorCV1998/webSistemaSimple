import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AjustesPublicos, PlanPublico, duracionPlan, fechaCorta, nombrePlan, soles, solesCorto } from '../../core/utils/membresia';

/**
 * Lista de planes de membresía tal como la ve el inversor. La usan el modal "Renovar membresía"
 * y la vista previa de Ajustes del sistema (admin), para que lo que configura el admin sea
 * exactamente lo que se muestra.
 */
@Component({
  selector: 'app-planes-membresia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planes-membresia.component.html',
  styleUrl: './planes-membresia.component.scss'
})
export class PlanesMembresiaComponent {

  @Input() ajustes: AjustesPublicos | null = null;
  @Input() seleccionado: PlanPublico | null = null;
  @Output() seleccionadoChange = new EventEmitter<PlanPublico>();

  nombre = nombrePlan;
  duracion = duracionPlan;
  soles = soles;
  solesCorto = solesCorto;
  fechaCorta = fechaCorta;

  get planes(): PlanPublico[] {
    return this.ajustes?.planes ?? [];
  }

  /** Precio del plan mensual sin oferta: referencia del ahorro. */
  private get precioMensual(): number {
    return this.planes.find(p => p.meses === 1)?.precio ?? 0;
  }

  porMes(plan: PlanPublico): number {
    return plan.precioFinal / plan.meses;
  }

  /** Cuánto se ahorra frente a pagar el plan mensual (a precio normal) todos esos meses. */
  ahorro(plan: PlanPublico): number {
    const referencia = plan.meses === 1 || !this.precioMensual ? plan.precio : this.precioMensual * plan.meses;
    return Math.max(0, Math.round((referencia - plan.precioFinal) * 100) / 100);
  }

  /** Meses "gratis" que representa el ahorro (solo si es al menos 1). */
  mesesGratis(plan: PlanPublico): number {
    if (!this.precioMensual || plan.meses < 6) return 0;
    return Math.floor(this.ahorro(plan) / this.precioMensual);
  }

  elegir(plan: PlanPublico) {
    this.seleccionado = plan;
    this.seleccionadoChange.emit(plan);
  }

  esSeleccionado(plan: PlanPublico): boolean {
    return this.seleccionado?.meses === plan.meses;
  }
}
