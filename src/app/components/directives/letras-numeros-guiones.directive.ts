import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appLetrasNumerosGuiones]',
  standalone: true
})
export class LetrasNumerosGuionesDirective {

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2
  ) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    // Regex que permite letras, números, guiones y espacios
    const regex = /[^a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ\- ]+/g;
    const initValue = this.elRef.nativeElement.value;
    const newValue = initValue.replace(regex, '');

    if (initValue !== newValue) {
      // Actualiza el valor del input
      this.renderer.setProperty(this.elRef.nativeElement, 'value', newValue);

      // Dispara el evento para que Angular detecte el cambio
      const inputEvent = new Event('input', { bubbles: true });
      this.elRef.nativeElement.dispatchEvent(inputEvent);

      event.stopPropagation();
    }
  }

}
