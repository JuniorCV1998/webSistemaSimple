import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNroPlaca]',
  standalone: true
})
export class NroPlacaDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: any): void {
    const inputValue = this.el.nativeElement.value;

    // Acepta letras, números y guiones, y convierte a mayúsculas
    const filteredValue = inputValue.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();

    if (filteredValue !== inputValue) {
      this.el.nativeElement.value = filteredValue;
      this.el.nativeElement.dispatchEvent(new Event('input'));
    }
  }
  
}
