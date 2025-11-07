import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-dialog-renovar-membresia',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ButtonModule],
  templateUrl: './dialog-renovar-membresia.component.html',
  styleUrl: './dialog-renovar-membresia.component.scss'
})
export class DialogRenovarMembresiaComponent {

  @Output() onCancelar = new EventEmitter<void>();
  @Output() onSeleccion = new EventEmitter<any>();

  visible = false;
  opcionSeleccionada: any = null;

  opciones = [
    { label: '1 mes', precio: 30 },
    { label: '2 meses', precio: 55 },
    { label: '3 meses', precio: 80 }
  ];

  abrir() {
    this.visible = true;
  }

  cerrar() {
    this.visible = false;
    this.onCancelar.emit();
  }

  seleccionar(opcion: any) {
    this.opcionSeleccionada = opcion;
  }

  confirmar() {
    if (this.opcionSeleccionada) {
      this.onSeleccion.emit(this.opcionSeleccionada);
      this.cerrar();
    }
  }
}
