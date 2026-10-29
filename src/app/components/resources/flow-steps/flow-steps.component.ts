import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Encabezado de un flujo por pasos (registrar préstamo / inversión vehicular).
 * Uso: <app-flow-steps [pasos]="['Préstamo','Cliente','Confirmar']" [actual]="2" titulo="..." subtitulo="..." />
 */
@Component({
  selector: 'app-flow-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flow-steps.component.html',
  styleUrl: './flow-steps.component.scss'
})
export class FlowStepsComponent {
  @Input() pasos: string[] = [];
  /** Paso actual, empezando en 1. */
  @Input() actual = 1;
  @Input() titulo = '';
  @Input() subtitulo = '';
}
