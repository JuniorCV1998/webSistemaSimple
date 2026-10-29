import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TabMenuModule } from 'primeng/tabmenu';
import { DialogRenovarMembresiaComponent, SolicitudRenovacion } from '../../../modal/dialog-renovar-membresia/dialog-renovar-membresia.component';
import { navegacionActual } from '../../../../core/ionic/page-host.component';
import { Constantes } from '../../../../core/constant/Constantes';

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

  /** Perfil de quien intentó ingresar (lo envía el login). */
  perfil: string | null = null;

  /**
   * Solo el inversor renueva su membresía; el cliente depende de la de su inversor.
   * Si el backend aún no envía el perfil, se muestra (como antes) para no bloquear al inversor.
   */
  get puedeRenovar(): boolean {
    return this.perfil ? this.perfil === Constantes.PERFIL_INV : true;
  }

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {
    const navigation = navegacionActual(this.router);
    const state = navigation?.extras?.state as { header?: string; body?: string; perfil?: string };

    if (state) {
      this.header = state.header ?? this.header;
      this.body = state.body ?? this.body;
      this.perfil = state.perfil ?? null;
    }
  }

  /** El modal arma el mensaje y el enlace con el WhatsApp configurado por el admin. */
  solicitarPorWhatsapp(solicitud: SolicitudRenovacion) {
    window.open(solicitud.enlace, '_blank');
  }

  continuar() {
    this.router.navigate(['/inicio']);
  }
}
