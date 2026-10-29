import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { CerrarOverlayAlNavegarDirective } from '../../directives/cerrar-overlay-al-navegar.directive';
import { COD_PAIS_PERU, PAISES, Pais, celularLimpio, celularValido } from '../../../core/utils/documento-pais';

/**
 * Celular con selector de código de país.
 * Uso: <app-celular-pais [(codPais)]="obj.codPais" [(celular)]="obj.celular" />
 * - Perú (+51): 9 dígitos empezando en 9, formateado "9xx xxx xxx".
 * - Otros países: solo dígitos, 4 a 15.
 * El valor de "celular" puede traer espacios; quien lo envía al backend usa celularLimpio().
 */
@Component({
  selector: 'app-celular-pais',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, CerrarOverlayAlNavegarDirective],
  templateUrl: './celular-pais.component.html',
  styleUrl: './celular-pais.component.scss'
})
export class CelularPaisComponent {

  @Input() celular: string | null = '';
  @Output() celularChange = new EventEmitter<string>();

  private _codPais = COD_PAIS_PERU;
  @Input() set codPais(valor: string | null | undefined) { this._codPais = valor || COD_PAIS_PERU; }
  get codPais(): string { return this._codPais; }
  @Output() codPaisChange = new EventEmitter<string>();

  @Input() disabled = false;
  @Input() inputId = 'celular';
  @Input() placeholder: string | null = null;
  /** Muestra el mensaje de error cuando el número no es válido (y no está vacío). */
  @Input() mostrarError = true;

  paises: Pais[] = PAISES;

  get paisSeleccionado(): Pais | undefined {
    return this.paises.find(p => p.codPais === this.codPais);
  }

  get esPeru(): boolean { return this.codPais === COD_PAIS_PERU; }

  get textoPlaceholder(): string {
    return this.placeholder ?? (this.esPeru ? '9** *** ***' : 'Número');
  }

  get invalido(): boolean {
    return !!celularLimpio(this.celular) && !celularValido(this.celular, this.codPais);
  }

  get mensajeError(): string {
    return this.esPeru ? 'Debe tener 9 dígitos y empezar con 9.' : 'Debe tener entre 4 y 15 dígitos.';
  }

  onPaisChange(cod: string): void {
    this._codPais = cod || COD_PAIS_PERU;
    this.codPaisChange.emit(this._codPais);
    // Reformatea lo ya escrito con la regla del nuevo país
    const formateado = this.formatear(this.celular || '');
    if (formateado !== this.celular) {
      this.celular = formateado;
      this.celularChange.emit(formateado);
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formateado = this.formatear(input.value);
    if (input.value !== formateado) input.value = formateado;
    this.celular = formateado;
    this.celularChange.emit(formateado);
  }

  private formatear(valor: string): string {
    let digitos = celularLimpio(valor);
    if (!this.esPeru) return digitos.slice(0, 15);
    if (digitos.length > 0 && digitos.charAt(0) !== '9') digitos = '9' + digitos.slice(1);
    digitos = digitos.slice(0, 9);
    return digitos.replace(/^(\d{3})(\d{1,3})?(\d{1,3})?$/, (_m, a, b, c) => [a, b, c].filter(Boolean).join(' '));
  }
}
