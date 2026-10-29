import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

type Tono = 'error' | 'aviso' | 'info';

/**
 * Mensaje genérico (errores, avisos). Se abre con DialogService pasando `header` y `data.message`.
 * El encabezado de PrimeNG se oculta por CSS (styles.scss, .p-dialog:has(app-message-pop-up)) y el
 * título se dibuja aquí, con un ícono según el tipo de mensaje.
 */
@Component({
  selector: 'app-message-pop-up',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  providers: [],
  templateUrl: './message-pop-up.component.html',
  styleUrl: './message-pop-up.component.scss'
})
export class MessagePopUpComponent {

  message: string = '';
  titulo: string = '';
  tono: Tono = 'info';

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ){
    this.message = config.data.message;
    this.titulo = this.formatearTitulo(config.header ?? '');
    this.tono = this.tonoPorTitulo(config.header ?? '');
  }

  get icono(): string {
    return this.tono === 'error' ? 'pi-times' : this.tono === 'aviso' ? 'pi-exclamation-triangle' : 'pi-info';
  }

  /* Los encabezados en MAYÚSCULAS (MSG_H_*) se muestran en formato oración */
  private formatearTitulo(header: string): string {
    const h = header.trim();
    if (h && h === h.toUpperCase()) return h.charAt(0) + h.slice(1).toLowerCase();
    return h;
  }

  private tonoPorTitulo(header: string): Tono {
    const h = header.toLowerCase();
    if (h.includes('error')) return 'error';
    if (h.includes('denegado') || h.includes('incorrecto') || h.includes('sin acceso') || h.includes('expir')) return 'aviso';
    return 'info';
  }

  close() {
    this.ref.close('aceptar');
  }

}
