import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { KnobModule } from 'primeng/knob';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { UsuarioService } from '../../../../core/services/usuario/usuario.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogRenovarMembresiaComponent } from '../../../modal/dialog-renovar-membresia/dialog-renovar-membresia.component';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule, KnobModule, LoadingComponent, ToastModule, InputNumberModule,
    TabMenuModule, ButtonModule, RouterModule, RouterLink, DialogRenovarMembresiaComponent],
  providers: [ConfirmationService],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export default class ProfileComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  /* Número de celular */
  nroCelular = "920605673";

  usuarioData: any = {
    "codUnico": "",
    "correo": "",
    "contrasena": null,
    "fechaCreacion": "",
    "idPersona": null,
    "persona": {},
    "membresia": {}
  }

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    public dialogService: DialogService,
  ) { }

  ngOnInit() {

    setTimeout(() => {
      this.loadingComponent.show();
      this.getPerfilData();
    });

  }

  getPerfilData() {
    this.usuarioService.getProfileData().pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
      // Manejamos errores de respuesta HTTP con catchError
      catchError((error) => {
        // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
        if (error.status === 400) this.show(error.error.descripcion, Constantes.MSG_H_400, true); // Mensaje para 400
        else if (error.status === 404) this.show(error.error.descripcion, Constantes.MSG_H_403, true);
        else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
        // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
        return of(null);
      })
    ).
      subscribe((resp: any) => {
        if (resp.codigo === Constantes.STATUS_SUCCESS_SV) {
          this.usuarioData = resp.data;
        }
      }
      );
  }

  show(message: string, header: string, inicio: boolean) {
    const ref = this.dialogService.open(MessagePopUpComponent, {
      data: {
        message: message
      },
      header: header,
      closable: false,
      closeOnEscape: false,
      modal: true,
      width: '90%'
    });

    // Suscribirse al evento de cierre del diálogo
    ref.onClose.subscribe((result: any) => {
      if (result === 'aceptar') {
        // Navegamos a la ruta deseada al aceptar
        if (inicio) this.router.navigate(['/inicio']);
      }
    });
  }

  formatNumberEspaciado(numero: string): string {
    try {
      return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } catch (error) {
      return "";
    }
  }

  solicitarPorWhatsapp(opcion: any) {
    const mensaje = encodeURIComponent(
      `¡Hola! Me gustaría renovar mi membresía con el plan de ${opcion.label} por S/${opcion.precio}.`
    );
    window.open(`https://wa.me/51${this.nroCelular}?text=${mensaje}`, '_blank');
  }
}
