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
  selector: 'app-membresia-exp',
  standalone: true,
  imports: [TabMenuModule, RouterLink, ButtonModule, ConfirmDialogModule, MessageModule, CommonModule,
    DialogRenovarMembresiaComponent],
  providers: [ConfirmationService],
  templateUrl: './membresia-exp.component.html',
  styleUrl: './membresia-exp.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MembresiaExpComponent {

  @Input() header: string = 'Advertencia';
  @Input() body: string = 'Hay información que requiere tu revisión.';

  /* Número de celular */
  nroCelular = "920605673";

  opcionSeleccionada: any = null;

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { header?: string; body?: string };

    if (state) {
      this.header = state.header ?? this.header;
      this.body = state.body ?? this.body;
    }
  }

  solicitarPorWhatsapp(opcion: any) {
    const mensaje = encodeURIComponent(
      `¡Hola! Me gustaría renovar mi membresía con el plan de ${opcion.label} por S/${opcion.precio}.`
    );
    console.log("entro: " + mensaje );
    window.open(`https://wa.me/51${this.nroCelular}?text=${mensaje}`, '_blank');
  }

  continuar() {
    this.router.navigate(['/inicio']);
  }
}
