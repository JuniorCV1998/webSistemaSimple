import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appFormatoMoneda]',
  standalone: true
})
export class FormatoMonedaDirective {

 // Expresión regular para números con comas y hasta dos decimales
 private regex: RegExp = new RegExp(/^\d{1,3}(?:,\d{3})*(?:\.\d{0,2})?$/);
 private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete', 'Enter'];

 constructor(private el: ElementRef) { }

 @HostListener('keydown', ['$event'])
 onKeyDown(event: KeyboardEvent): void {
   if (this.specialKeys.indexOf(event.key) !== -1) {
     return;
   }
   // Permitir dígitos, comas y puntos decimales
   if (!/[\d,.]/.test(event.key)) {
     event.preventDefault();
   }
 }

 @HostListener('input', ['$event'])
 onInput(event: any): void {
   let value = this.el.nativeElement.value.replace(/,/g, ''); // Elimina las comas antes de formatear

   // Añadir el formato adecuado
   this.el.nativeElement.value = this.formatNumber(value);
 }

 private formatNumber(value: string): string {
   if (!value) return '';
   
   // Dividir en parte entera y decimal
   const [integerPart, decimalPart] = value.split('.');

   // Formatear parte entera con comas
   const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

   // Reunir parte entera con parte decimal
   return decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;
 }

}
