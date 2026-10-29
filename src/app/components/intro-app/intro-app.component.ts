import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

/** Duración mínima de la animación de entrada (logo + nombre + lema). */
const DURACION_MINIMA = 2100;
/** Tiempo del fundido de salida (debe coincidir con .intro-saliendo en el scss). */
const DURACION_SALIDA = 450;

/**
 * Intro de marca al abrir la app en el celular. Se retira cuando pasó la animación
 * y la primera pantalla ya está lista (`listo`), lo que ocurra último.
 */
@Component({
  selector: 'app-intro-app',
  standalone: true,
  templateUrl: './intro-app.component.html',
  styleUrl: './intro-app.component.scss'
})
export class IntroAppComponent implements OnInit, OnChanges {
  /** La primera pantalla terminó de navegar. */
  @Input() listo = false;
  @Output() terminada = new EventEmitter<void>();

  saliendo = false;
  private animacionCompleta = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.animacionCompleta = true;
      this.intentarSalir();
    }, DURACION_MINIMA);
  }

  ngOnChanges(): void {
    this.intentarSalir();
  }

  private intentarSalir(): void {
    if (this.saliendo || !this.animacionCompleta || !this.listo) return;
    this.saliendo = true;
    setTimeout(() => this.terminada.emit(), DURACION_SALIDA);
  }
}
