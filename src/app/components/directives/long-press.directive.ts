import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective {

  private timeout: any;

  @Output() longPress = new EventEmitter<void>();

  @HostListener('mousedown') onMouseDown() {
    this.timeout = setTimeout(() => {
      this.longPress.emit();
    }, 1000); // ⏱️ 1 segundo
  }

  @HostListener('mouseup') onMouseUp() {
    clearTimeout(this.timeout);
  }

  @HostListener('mouseleave') onMouseLeave() {
    clearTimeout(this.timeout);
  }

  // Para móviles
  @HostListener('touchstart') onTouchStart() {
    this.timeout = setTimeout(() => {
      this.longPress.emit();
    }, 1000);
  }

  @HostListener('touchend') onTouchEnd() {
    clearTimeout(this.timeout);
  }

}
