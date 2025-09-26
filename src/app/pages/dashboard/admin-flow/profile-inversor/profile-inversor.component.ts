import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { KnobModule } from 'primeng/knob';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-profile-inversor',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule, KnobModule, LoadingComponent, ToastModule, InputNumberModule,
    TabMenuModule
  ],
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
  nuevaFechaStr: string = "";
  montoPago: any = null;

  constructor(
    private confirmationService: ConfirmationService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: any) => {
      const id = params.get('idInversor');
      this.idInversor = id ? +id : null; // Convertir a número si existe
    });


    setTimeout(() => {
      this.loadingComponent.show();
      this.getInversorData();
    });

  }

  getInversorData() {
    this.adminService.getInversorDetail(this.idInversor === null ? 0 : this.idInversor).pipe(
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

  private parseFecha(fechaStr: string): Date {
    // Mapear meses abreviados en español
    const meses: Record<string, number> = {
      'ene.': 0, 'feb.': 1, 'mar.': 2, 'abr.': 3,
      'may.': 4, 'jun.': 5, 'jul.': 6, 'ago.': 7,
      'set.': 8, 'sept.': 8, 'oct.': 9, 'nov.': 10, 'dic.': 11
    };

    const partes = fechaStr.split(" ");
    const dia = parseInt(partes[0], 10);
    const mes = meses[partes[2]];
    const anio = parseInt(partes[3], 10);

    return new Date(anio, mes, dia);
  }

  actualizarNuevaFecha() {
    let codMembresia = this.inversorData.membresia.codMembresia;
    let fechaVencimiento = this.parseFecha(this.inversorData.membresia.fechaVencimiento);
    let mesesAdicionales = this.meses;

    //console.log("parametros: ", codMembresia+" | "+fechaVencimiento+" | "+mesesAdicionales);

    let nuevaFecha: Date;

    if (codMembresia === 'ACT' || codMembresia === 'PEX') {
      nuevaFecha = new Date(fechaVencimiento);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + mesesAdicionales);
    } else if (codMembresia === 'VEN') {
      nuevaFecha = new Date();
      nuevaFecha.setMonth(nuevaFecha.getMonth() + mesesAdicionales);
    } else {
      nuevaFecha = new Date(fechaVencimiento);
    }

    this.nuevaFechaStr = nuevaFecha.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }


  updateMembresiaService() {
    if (this.nuevaFechaStr === "") this.actualizarNuevaFecha();
    this.updateMembresia().then((result) => {
      if (result) {
        this.loadingComponent.show();
        let requestBody: any = {
          "meses": this.meses,
          "montoPagado": this.montoPago
        }
        this.adminService.updateMembresia(this.inversorData.membresia.idMembresia, requestBody).pipe(
          finalize(() => this.loadingComponent.hide()),
          catchError((error) => {
            const messageData = {
              severity: 'error',
              summary: Constantes.MSG_SERVICE_ERROR,
              detail: error.error.descripcion,
              life: 3000
            };
            this.messageService.add(messageData);

            return of(null);
          })
        ).subscribe((resp: any) => {
          const messageData = {
            severity: 'success',
            summary: Constantes.MSG_SERVICE_UPDATE,
            detail: resp.descripcion,
            life: 3000
          };
          this.messageService.add(messageData);
          this.getInversorData();
        });
      }
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

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.meses !== null && this.meses !== 0 &&
      this.montoPago !== null && this.montoPago >= 1 && this.montoPago <= 100000
    );
  }

}
