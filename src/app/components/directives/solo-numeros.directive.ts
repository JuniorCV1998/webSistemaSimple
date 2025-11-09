import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appSoloNumeros]',
  standalone: true
})
export class SoloNumerosDirective {

  constructor(private ngControl: NgControl) { }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newValue = input.value.replace(/[^0-9]/g, '');

    // actualiza el input en el DOM
    input.value = newValue;

    // actualiza también el modelo interno de Angular Forms
    this.ngControl.control?.setValue(newValue, { emitEvent: true });
  }

}
