import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PlanesMembresiaComponent } from '../../../components/planes-membresia/planes-membresia.component';
import { SystemService } from '../../../core/services/system/system.service';
import { etiquetaDocumento } from '../../../core/utils/documento-pais';
import { AjustesPublicos, PlanPublico, documentoGuardado, duracionPlan, enlaceWhatsapp, nombrePlan, solesCorto } from '../../../core/utils/membresia';

/** Lo que recibe la pantalla al confirmar: el plan elegido y el enlace de WhatsApp ya armado. */
export interface SolicitudRenovacion {
  label: string;
  precio: string;
  plan: PlanPublico;
  enlace: string;
}

@Component({
  selector: 'app-dialog-renovar-membresia',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ButtonModule, PlanesMembresiaComponent],
  templateUrl: './dialog-renovar-membresia.component.html',
  styleUrl: './dialog-renovar-membresia.component.scss'
})
export class DialogRenovarMembresiaComponent {

  /** Documento del usuario; si no se pasa, se usa el guardado al iniciar sesión. */
  @Input() documento: { codTipoDoc?: string; nroDocumento: string } | null = null;

  @Output() onCancelar = new EventEmitter<void>();
  @Output() onSeleccion = new EventEmitter<SolicitudRenovacion>();

  visible = false;
  ajustes: AjustesPublicos | null = null;
  seleccionado: PlanPublico | null = null;

  constructor(private systemService: SystemService) { }

  abrir() {
    this.visible = true;
    this.systemService.ajustesPublicos().subscribe(ajustes => {
      this.ajustes = ajustes;
      // Se preselecciona el plan recomendado: es el que se quiere vender
      this.seleccionado = ajustes.planes.find(p => p.destacado) ?? null;
    });
  }

  cerrar() {
    this.visible = false;
    this.onCancelar.emit();
  }

  confirmar() {
    const plan = this.seleccionado;
    if (!plan || !this.ajustes) return;

    const label = `${nombrePlan(plan.meses)} (${duracionPlan(plan.meses)})`;
    const precio = solesCorto(plan.precioFinal);
    const oferta = this.ajustes.oferta && plan.precioFinal < plan.precio
      ? ` con la oferta "${this.ajustes.oferta.texto || 'Oferta especial'}"` : '';
    const doc = this.documento ?? documentoGuardado();
    const etiqueta = doc ? etiquetaDocumento(doc.codTipoDoc) : '-';
    const identificacion = doc ? ` Mi ${etiqueta === '-' ? 'documento' : etiqueta} es ${doc.nroDocumento}.` : '';
    const mensaje = `¡Hola! Me gustaría renovar mi membresía con el plan ${label} por S/ ${precio}${oferta}.${identificacion}`;

    this.onSeleccion.emit({ label, precio, plan, enlace: enlaceWhatsapp(this.ajustes.contacto, mensaje) });
    this.cerrar();
  }
}
