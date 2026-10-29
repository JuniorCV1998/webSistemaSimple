import { DestroyRef, Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';

/**
 * Cierra el panel de un p-select / p-datepicker con appendTo="body" al navegar.
 * Ionic deja viva la página anterior en el ion-router-outlet, así que si el panel estaba abierto
 * (vive en <body>, fuera de la página) se quedaba flotando encima de la pantalla siguiente.
 */
@Directive({
  selector: 'p-select[appendTo="body"], p-datepicker[appendTo="body"]',
  standalone: true
})
export class CerrarOverlayAlNavegarDirective {

  private select = inject(Select, { self: true, optional: true });
  private datePicker = inject(DatePicker, { self: true, optional: true });

  constructor() {
    inject(Router).events.pipe(
      filter(e => e instanceof NavigationStart),
      takeUntilDestroyed(inject(DestroyRef))
    ).subscribe(() => {
      if (this.select?.overlayVisible) this.select.hide();
      if (this.datePicker?.overlayVisible) this.datePicker.hideOverlay();
    });
  }
}
