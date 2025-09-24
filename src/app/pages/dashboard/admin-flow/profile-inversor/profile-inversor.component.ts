import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { KnobModule } from 'primeng/knob';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { catchError, delay, finalize, of, throwError } from 'rxjs';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Constantes } from '../../../../core/constant/Constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile-inversor',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule, KnobModule, LoadingComponent, ToastModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './profile-inversor.component.html',
  styleUrl: './profile-inversor.component.scss'
})
export default class ProfileInversorComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  idInversor: number | null = null;

  /* Inversor data */
  inversorData: any = {
    "idUsuario": null,
    "codUnico": "",
    "correo": "",
    "acceso": "",
    "idPersona": null,
    "persona": {
      "codTipoDoc": null,
      "nroDocumento": null,
      "nombres": "",
      "apellidoPaterno": "",
      "apellidoMaterno": "",
      "razonSocial": null,
      "nombreComercial": null,
      "celular": "",
      "direccion": ""
    },
    "membresia": {
      "idMembresia": null,
      "codTipoMembresia": "",
      "descTipoMembresia": "",
      "fechaActivacion": "",
      "fechaVencimiento": "",
      "fechaActualizacion": "",
      "codMembresia": "",
      "descCodMembresia": "",
      "diasRestantes": null
    }
  };

  /* Estado del usuario */
  statusActivo: boolean = false;

  /* Numero de meses */
  meses: number = 1;
  fechaActual: Date = new Date();
  nuevaFecha: Date = new Date();

  constructor(
    private confirmationService: ConfirmationService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversor');
      this.idInversor = id ? +id : null; // Convertir a número si existe
    });

    this.calcularNuevaFecha();
    setTimeout(() => {
      this.loadingComponent.show();
      this.getInversorData();
    });
  }

  getInversorData() {
    this.adminService.getInversorDetail(this.idInversor===null?0:this.idInversor).pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
      // Manejamos errores de respuesta HTTP con catchError
      catchError((error) => {
        // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
        if (error.status === 400) this.show(Constantes.MSG_400, Constantes.MSG_H_400, true); // Mensaje para 400
        else if (error.status === 403) this.show(error.error.descripcion, Constantes.MSG_H_403, true);
        else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
        // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
        return of(null);
      })
    ).
      subscribe((resp: any) => {
        if (resp.acceso === Constantes.ACCES_S) this.statusActivo = true;
        else this.statusActivo = false;

        this.inversorData = resp;
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
        if (inicio) this.router.navigate(['/vehicular/inicio']);
      }
    });
  }

  onToggleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const nuevoStatus = input.checked;

    // Revertimos inmediatamente en la UI (para que no cambie hasta confirmar)
    input.checked = this.statusActivo;

    // Intentamos actualizar en backend
    this.actualizarAccesoUsuario(this.inversorData.idUsuario, nuevoStatus);
  }

  actualizarAccesoUsuario(idUsuario: number, nuevoStatus: boolean) {
    this.loadingComponent.show();
    this.adminService.updateAccesoUsuario(idUsuario, nuevoStatus).pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError((error) => {
        const messageData = {
          severity: 'error',
          summary: Constantes.MSG_SERVICE_ERROR,
          detail: error.error.descripcion,
          life: 3000
        };
        this.messageService.add(messageData);

        // Revertimos el valor en la UI porque falló
        this.statusActivo = !nuevoStatus;

        return of(null);
      })
    ).subscribe((resp: any) => {
      if (resp?.codigo === Constantes.STATUS_SUCCESS_SV) {
        this.statusActivo = nuevoStatus; // solo si fue exitoso
        const messageData = {
          severity: 'success',
          summary: Constantes.MSG_SERVICE_UPDATE,
          detail: resp.descripcion,
          life: 3000
        };
        this.messageService.add(messageData);
        this.getInversorData();
      }
    });
  }


  ngOnChanges() {
    this.calcularNuevaFecha();
  }

  calcularNuevaFecha() {
    const nueva = new Date(this.fechaActual);
    nueva.setMonth(nueva.getMonth() + this.meses);
    this.nuevaFecha = nueva;
  }

  updateMembresiaService() {
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

  formatNumberEspaciado(numero: string): string {
    return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

}
