import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { KnobModule } from 'primeng/knob';

@Component({
  selector: 'app-profile-inversor',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule, KnobModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './profile-inversor.component.html',
  styleUrl: './profile-inversor.component.scss'
})
export default class ProfileInversorComponent {

  /* Estado del usuario */
  statusActivo: boolean = true;

  /* Numero de meses */
  meses: number = 1;
  fechaActual: Date = new Date();
  nuevaFecha: Date = new Date();

  constructor(
    private confirmationService: ConfirmationService,
  ){}

  ngOnInit() {
  this.calcularNuevaFecha();
}

ngOnChanges() {
  this.calcularNuevaFecha();
}

calcularNuevaFecha() {
  const nueva = new Date(this.fechaActual);
  nueva.setMonth(nueva.getMonth() + this.meses);
  this.nuevaFecha = nueva;
}

  updateMembresiaService(){
    this.updateMembresia().then((result) => {

    });
  }

  updateMembresia(): Promise<boolean> {
    return new Promise((resolve) => {
        this.confirmationService.confirm({
            key: 'update_membresia',
            header: 'Actualizar Membresía',
            message: '¿Está seguro que desea eliminar esta inversión?',
            accept: () => {
                resolve(true);  // Resuelve la promesa con "true" si acepta
            },
            reject: () => {
                resolve(false); // Resuelve la promesa con "false" si rechaza
            }
        });
    });
  }
  incrementar() {
    if (this.meses + this.meses <= 12) {
      this.meses += this.meses;
    }
  }

  decrementar() {
    if (this.meses - this.meses >= 1) {
      this.meses -= this.meses;
    }
  }

}
