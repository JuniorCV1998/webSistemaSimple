import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TabMenuModule } from 'primeng/tabmenu';
import { DialogRenovarMembresiaComponent } from '../../../modal/dialog-renovar-membresia/dialog-renovar-membresia.component';

@Component({
  selector: 'app-without-access',
  standalone: true,
  imports: [TabMenuModule, RouterLink, ButtonModule, ConfirmDialogModule, MessageModule, CommonModule,
    DialogRenovarMembresiaComponent],
    providers: [ConfirmationService],
  templateUrl: './without-access.component.html',
  styleUrl: './without-access.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WithoutAccessComponent {

  @Input() header: string = 'Advertencia';
  @Input() body: string = 'Hay información que requiere tu revisión.';

  /* Número de celular */
  nroCelular = '920605673';

  opcionSeleccionada: any = null;

  constructor(
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { header?: string; body?: string };

    if (state) {
      this.header = state.header ?? this.header;
      this.body = state.body ?? this.body;
    }
  }

  soportePorWhatsapp() {
    const mensaje = encodeURIComponent(
      `Hola, tengo problemas para acceder a mi cuenta. ¿Podrían asistirme, por favor?`
    );
    window.open(`https://wa.me/51${this.nroCelular}?text=${mensaje}`, '_blank');
  }

}
