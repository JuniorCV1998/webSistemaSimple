import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSoloLetras]',
  standalone: true
})
export class SoloLetrasDirective {

  constructor(
    private readonly elRef: ElementRef,
  ) { }

  @HostListener('input',['$event'])
  onchangeInput(event: Event):void{  //captura el elemento en el DOM
    //const regex = /[^a-z ]*/g ;
    const regex = /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ ]+/g;
    const initVaule = this.elRef.nativeElement.value;
    this.elRef.nativeElement.value = initVaule.replace(regex,'');
    if(initVaule !== this.elRef.nativeElement.value) event.stopPropagation();
    
  }
}
