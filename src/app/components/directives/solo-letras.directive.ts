import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSoloLetras]',
  standalone: true
})
export class SoloLetrasDirective {


  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2
  ) { }

  @HostListener('input', ['$event'])
  onchangeInput(event: Event): void {
    const regex = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+/g;
    const initValue = this.elRef.nativeElement.value;
    const newValue = initValue.replace(regex, '');

    // Solo actualiza si hay un cambio
    if (initValue !== newValue) {
      // Cambia el valor del input
      this.renderer.setProperty(this.elRef.nativeElement, 'value', newValue);

      // Crea y despacha un evento de cambio
      const inputEvent = new Event('input', { bubbles: true });
      this.elRef.nativeElement.dispatchEvent(inputEvent);

      event.stopPropagation();
    }
  }
}
