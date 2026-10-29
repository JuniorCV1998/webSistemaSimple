import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

/** Lado del PNG final; se reduce si el archivo supera PESO_MAXIMO. */
const LADOS_SALIDA = [512, 400, 320, 256];
const PESO_MAXIMO = 200 * 1024;

/**
 * Recortador cuadrado para logos y sellos: mover con el dedo, pellizcar o deslizar para el zoom,
 * ajustar (imagen completa) o rellenar (cubre el cuadro), girar y elegir fondo.
 * Entrega un PNG cuadrado listo para subir.
 */
@Component({
  selector: 'app-recortar-imagen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recortar-imagen.component.html',
  styleUrl: './recortar-imagen.component.scss'
})
export class RecortarImagenComponent implements OnInit, OnDestroy {
  /** URL de la imagen elegida (object URL). */
  @Input({ required: true }) src!: string;
  @Input() titulo = 'Ajusta tu imagen';
  /** Nombre del archivo que se entrega (sin extensión). */
  @Input() nombre = 'imagen';

  @Output() listo = new EventEmitter<File>();
  @Output() cancelado = new EventEmitter<void>();

  /** Lado del cuadro en pantalla (px). */
  lado = 300;
  fuente = '';
  private ancho = 0;  // tamaño natural de la fuente
  private alto = 0;

  escala = 1;
  escalaMin = 1;
  escalaMax = 4;
  x = 0;
  y = 0;

  fondoBlanco = false;
  moviendo = false;
  procesando = false;
  cargada = false;

  private punteros = new Map<number, { x: number; y: number }>();
  private distanciaInicial = 0;
  private escalaInicial = 1;

  constructor(private host: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    // Va directo en <body>: dentro de la página quedaría debajo de la barra de pestañas
    document.body.appendChild(this.host.nativeElement);
    this.lado = Math.min(320, Math.max(220, window.innerWidth - 72));
    this.cargar(this.src);
  }

  ngOnDestroy(): void {
    this.host.nativeElement.remove();
  }

  get anchoVisible(): number { return this.ancho * this.escala; }
  get altoVisible(): number { return this.alto * this.escala; }

  /** Escala en la que la imagen entra completa / cubre todo el cuadro. */
  private get escalaAjustar(): number { return this.lado / Math.max(this.ancho, this.alto); }
  private get escalaRellenar(): number { return this.lado / Math.min(this.ancho, this.alto); }

  get modo(): 'ajustar' | 'rellenar' | null {
    if (Math.abs(this.escala - this.escalaAjustar) < 0.001) return 'ajustar';
    if (Math.abs(this.escala - this.escalaRellenar) < 0.001) return 'rellenar';
    return null;
  }

  /** Posición del deslizador (0–100) en escala logarítmica, para que el zoom se sienta parejo. */
  get zoomPorcentaje(): number {
    return (Math.log(this.escala / this.escalaMin) / Math.log(this.escalaMax / this.escalaMin)) * 100;
  }

  private cargar(url: string): void {
    const img = new Image();
    img.onload = () => {
      this.fuente = url;
      this.ancho = img.naturalWidth;
      this.alto = img.naturalHeight;
      this.escalaMin = this.escalaAjustar;
      this.escalaMax = this.escalaRellenar * 4;
      this.ajustar();
      this.cargada = true;
    };
    img.src = url;
  }

  ajustar(): void { this.zoomA(this.escalaAjustar, true); }
  rellenar(): void { this.zoomA(this.escalaRellenar, true); }

  onZoomSlider(ev: Event): void {
    const p = +(ev.target as HTMLInputElement).value / 100;
    this.zoomA(this.escalaMin * Math.pow(this.escalaMax / this.escalaMin, p));
  }

  zoomPaso(factor: number): void { this.zoomA(this.escala * factor); }

  /** Cambia el zoom manteniendo fijo el punto (cx, cy) del cuadro (por defecto, el centro). */
  private zoomA(nueva: number, centrar = false, cx = this.lado / 2, cy = this.lado / 2): void {
    nueva = Math.min(this.escalaMax, Math.max(this.escalaMin, nueva));
    if (centrar) {
      this.escala = nueva;
      this.x = (this.lado - this.anchoVisible) / 2;
      this.y = (this.lado - this.altoVisible) / 2;
      return;
    }
    const r = nueva / this.escala;
    this.x = cx - (cx - this.x) * r;
    this.y = cy - (cy - this.y) * r;
    this.escala = nueva;
    this.limitar();
  }

  /** Si la imagen es más chica que el cuadro no sale de él; si es más grande, no deja huecos. */
  private limitar(): void {
    const eje = (pos: number, tam: number) =>
      tam <= this.lado ? Math.min(this.lado - tam, Math.max(0, pos)) : Math.min(0, Math.max(this.lado - tam, pos));
    this.x = eje(this.x, this.anchoVisible);
    this.y = eje(this.y, this.altoVisible);
  }

  /* ===== Gestos (mouse, dedo y pellizco) ===== */

  onPointerDown(ev: PointerEvent): void {
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    this.punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    this.moviendo = true;
    if (this.punteros.size === 2) {
      this.distanciaInicial = this.distanciaPunteros();
      this.escalaInicial = this.escala;
    }
  }

  onPointerMove(ev: PointerEvent): void {
    const previo = this.punteros.get(ev.pointerId);
    if (!previo) return;
    const actual = { x: ev.clientX, y: ev.clientY };
    this.punteros.set(ev.pointerId, actual);

    if (this.punteros.size === 1) {
      this.x += actual.x - previo.x;
      this.y += actual.y - previo.y;
      this.limitar();
    } else if (this.punteros.size === 2 && this.distanciaInicial > 0) {
      const marco = (ev.currentTarget as HTMLElement).getBoundingClientRect();
      const [a, b] = [...this.punteros.values()];
      this.zoomA(this.escalaInicial * (this.distanciaPunteros() / this.distanciaInicial), false,
        (a.x + b.x) / 2 - marco.left, (a.y + b.y) / 2 - marco.top);
    }
  }

  onPointerUp(ev: PointerEvent): void {
    this.punteros.delete(ev.pointerId);
    if (this.punteros.size < 2) this.distanciaInicial = 0;
    if (this.punteros.size === 0) this.moviendo = false;
  }

  onWheel(ev: WheelEvent): void {
    ev.preventDefault();
    const marco = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    this.zoomA(this.escala * (ev.deltaY < 0 ? 1.08 : 1 / 1.08), false, ev.clientX - marco.left, ev.clientY - marco.top);
  }

  private distanciaPunteros(): number {
    const [a, b] = [...this.punteros.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /** Gira 90° generando una nueva fuente ya rotada. */
  girar(): void {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalHeight;
      c.height = img.naturalWidth;
      const ctx = c.getContext('2d')!;
      ctx.translate(c.width, 0);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, 0, 0);
      this.cargar(c.toDataURL('image/png'));
    };
    img.src = this.fuente;
  }

  @HostListener('document:keydown.escape')
  cancelar(): void {
    if (!this.procesando) this.cancelado.emit();
  }

  /** Dibuja lo que se ve en el cuadro en un PNG cuadrado (más chico si supera el peso máximo). */
  async confirmar(): Promise<void> {
    if (!this.cargada || this.procesando) return;
    this.procesando = true;
    try {
      const img = await this.imagen(this.fuente);
      let blob: Blob | null = null;
      for (const lado of LADOS_SALIDA) {
        blob = await this.dibujar(img, lado);
        if (blob && blob.size <= PESO_MAXIMO) break;
      }
      if (blob) this.listo.emit(new File([blob], `${this.nombre}.png`, { type: 'image/png' }));
    } finally {
      this.procesando = false;
    }
  }

  private imagen(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private dibujar(img: HTMLImageElement, salida: number): Promise<Blob | null> {
    const c = document.createElement('canvas');
    c.width = c.height = salida;
    const ctx = c.getContext('2d')!;
    if (this.fondoBlanco) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, salida, salida);
    }
    ctx.imageSmoothingQuality = 'high';
    const k = salida / this.lado;
    ctx.drawImage(img, this.x * k, this.y * k, this.anchoVisible * k, this.altoVisible * k);
    return new Promise(resolve => c.toBlob(resolve, 'image/png'));
  }
}
