import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSoloFloat]',
  standalone: true
})
export class SoloFloatDirective {

  constructor(private readonly elRef: ElementRef) { }

  @HostListener('input', ['$event'])
  onchangeInput(event: Event): void {
    const regex = /^[0-9]*\.?[0-9]{0,2}$/;
    const initValue = this.elRef.nativeElement.value;

    // Verifica si el valor cumple con la expresión regular
    if (!regex.test(initValue)) {
      // Si no cumple, elimina caracteres no válidos
      const newValue = initValue.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); // Elimina cualquier carácter que no sea número o punto
      this.elRef.nativeElement.value = newValue.match(regex) ? newValue : newValue.slice(0, -1);
      event.stopPropagation();
    }
  }

}
