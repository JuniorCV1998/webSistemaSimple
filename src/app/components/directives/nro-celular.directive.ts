import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appNroCelular]',
  standalone: true
})
export class NroCelularDirective {

  constructor(
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2
  ) { }

  @HostListener('input', ['$event'])
  onchangeInput(event: Event): void {
    const numeroRegex = /[^0-9]*/g;
    let initValue = this.elRef.nativeElement.value;
    
    // Solo permitir números
    initValue = initValue.replace(numeroRegex, '');

    // Si el primer número no es 9, se reemplaza por 9
    if (initValue.length > 0 && initValue.charAt(0) !== '9') {
      initValue = '9' + initValue.slice(1);
    }

    // Formatear como 9XX-XXX-XXX
    if (initValue.length > 1) {
      initValue = initValue.slice(0, 9); // Limitar longitud máxima
      initValue = initValue.replace(/(\d{1})(\d{2})(\d{3})(\d{3})/, '$1$2 $3 $4');
    }

    // Solo actualiza si hay un cambio
    if (this.elRef.nativeElement.value !== initValue) {
      // Cambia el valor del input
      this.renderer.setProperty(this.elRef.nativeElement, 'value', initValue);

      // Crea y despacha un evento de cambio
      const inputEvent = new Event('input', { bubbles: true });
      this.elRef.nativeElement.dispatchEvent(inputEvent);
      
      event.stopPropagation();
    }
  }

}
