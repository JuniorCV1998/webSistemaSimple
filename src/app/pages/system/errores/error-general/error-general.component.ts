import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-error-general',
  standalone: true,
  imports: [ConfirmDialogModule, TabMenuModule,RouterLink],
  templateUrl: './error-general.component.html',
  styleUrl: './error-general.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ErrorGeneralComponent {
  @Input() header: string = 'Ups, algo salió mal';
  @Input() body: string = 'Ha ocurrido un error en la aplicación. Intente nuevamente.';
}
