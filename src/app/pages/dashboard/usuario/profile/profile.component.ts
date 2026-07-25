import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { KnobModule } from 'primeng/knob';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { NroCelularDirective } from '../../../../components/directives/nro-celular.directive';
import { SoloNumerosDirective } from '../../../../components/directives/solo-numeros.directive';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { UsuarioService } from '../../../../core/services/usuario/usuario.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogRenovarMembresiaComponent } from '../../../modal/dialog-renovar-membresia/dialog-renovar-membresia.component';
import { ConfirmationService } from 'primeng/api';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule, KnobModule, LoadingComponent, ToastModule, InputNumberModule,
    TabMenuModule, ButtonModule, RouterModule, RouterLink, DialogRenovarMembresiaComponent, NroCelularDirective,
    SoloNumerosDirective, InputTextModule],
  providers: [ConfirmationService, MessageService],
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

  perfil: string = '';

  /* Edición de datos propios */
  editando: boolean = false;
  guardandoDatos: boolean = false;
  passwordFieldType: string = 'password';
  formEdit = { celular: '', direccion: '', contrasena: '' };

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    public dialogService: DialogService,
    private tempDataService: TempDataService,
    private messageService: MessageService
  ) {
    if(this.tempDataService.hasConstant("codPerfil")) this.perfil = this.tempDataService.getConstant("codPerfil") ?? '';
   }

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

  /* EDICIÓN DE DATOS PROPIOS */

  toggleEditar(): void {
    if (!this.editando) {
      this.formEdit.celular = this.usuarioData?.persona?.celular || '';
      this.formEdit.direccion = this.usuarioData?.persona?.direccion || '';
      this.formEdit.contrasena = '';
      this.passwordFieldType = 'password';
    }
    this.editando = !this.editando;
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  get celularValido(): boolean {
    const limpio = this.formEdit.celular.replace(/\s+/g, '');
    return limpio === '' || limpio.length === 9;
  }

  get contrasenaValida(): boolean {
    return this.formEdit.contrasena === '' || /^\d{6}$/.test(this.formEdit.contrasena);
  }

  private hayCambios(): boolean {
    const celularActual = (this.usuarioData?.persona?.celular || '').replace(/\s+/g, '');
    const direccionActual = (this.usuarioData?.persona?.direccion || '').trim();
    return this.formEdit.celular.replace(/\s+/g, '') !== celularActual
      || this.formEdit.direccion.trim() !== direccionActual
      || this.formEdit.contrasena !== '';
  }

  get puedeGuardar(): boolean {
    return this.hayCambios() && this.celularValido && this.contrasenaValida && !this.guardandoDatos;
  }

  guardarDatos(): void {
    if (!this.puedeGuardar) return;

    const body: { celular?: string; direccion?: string; contrasena?: string } = {};
    const celularActual = (this.usuarioData?.persona?.celular || '').replace(/\s+/g, '');
    const celularNuevo = this.formEdit.celular.replace(/\s+/g, '');
    if (celularNuevo && celularNuevo !== celularActual) body.celular = celularNuevo;

    const direccionActual = (this.usuarioData?.persona?.direccion || '').trim();
    const direccionNueva = this.formEdit.direccion.trim();
    if (direccionNueva && direccionNueva !== direccionActual) body.direccion = direccionNueva;

    if (this.formEdit.contrasena) body.contrasena = this.formEdit.contrasena;

    if (Object.keys(body).length === 0) {
      this.editando = false;
      return;
    }

    this.guardandoDatos = true;
    this.loadingComponent.show();
    this.usuarioService.updateProfile(body).pipe(
      finalize(() => {
        this.guardandoDatos = false;
        this.loadingComponent.hide();
      })
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: Constantes.MSG_SERVICE_UPDATE,
          detail: Constantes.MSG_SERVICE_DESC_UPDATE, life: 3000
        });
        this.editando = false;
        this.getPerfilData();
      },
      error: (error) => {
        let detail = Constantes.MSG_500;
        if (error.status === 400) detail = error.error?.descripcion || Constantes.MSG_400;
        else if (error.status === 403) detail = 'No tienes permiso para editar estos datos.';
        this.messageService.add({ severity: 'error', summary: Constantes.MSG_SERVICE_ERROR, detail, life: 3500 });
      }
    });
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
