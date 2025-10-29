import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { KnobModule } from 'primeng/knob';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { InversoresService } from '../../../../core/services/inversores/inversores.service';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule, KnobModule, LoadingComponent, ToastModule, InputNumberModule,
    TabMenuModule, FormatNumberPipe, ButtonModule, RouterModule, RouterLink, SkeletonModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './cliente-detail.component.html',
  styleUrl: './cliente-detail.component.scss'
})
export default class ClienteDetailComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  idUsuario: number | null = null;

  /* Inversor data */
  clienteData: any = {
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
    "credenciales": {
      "correo": "",
      "contrasena": ""
    },
    "acceso": "",
    "fechaRegistro": "",
    "detalle": false
  }

  /* Estado del usuario */
  statusActivo: boolean = false;
  /* Estado copiar credenciales */
  copy: boolean = false;


  // Mostrar inversiones
  mostrarInversiones: boolean = false;
  skeletonShow: boolean = true;
  ultimasInversiones: any[] = [];
  ultimas10Inversiones: any[] = [];
  currency: string | null = null;
  forSkeleton: number = 5;

  constructor(
    private inversoresService: InversoresService,
    private route: ActivatedRoute,
    private router: Router,
    public dialogService: DialogService,
    private messageService: MessageService,
    private tempDataService: TempDataService,
    private adminService: AdminService,
  ) {
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }

  ngOnInit() {
    // Recuperar el parámetro de consulta `idInversor`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idUsuario');
      this.idUsuario = id ? +id : null; // Convertir a número si existe
    });

    this.getClienteData();
  }

  getClienteData() {
    this.inversoresService.getClienteDetail(this.idUsuario ?? 0).pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
      // Manejamos errores de respuesta HTTP con catchError
      catchError((error) => {
        // Aquí manejamos los diferentes errores HTTP (400, 500, etc.)
        if (error.status === 400) this.show(Constantes.MSG_400, Constantes.MSG_H_400, true); // Mensaje para 400
        else if (error.status === 404) this.show(error.error.descripcion, Constantes.MSG_H_403, true);
        else this.show(Constantes.MSG_500, Constantes.MSG_H_500, true); // Mensaje para otros errores
        // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
        return of(null);
      })
    ).
      subscribe((resp: any) => {

        this.clienteData = resp;

        if (resp.acceso === Constantes.ACCES_S) this.statusActivo = true;
        else this.statusActivo = false;
      }

      );
  }

  onToggleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const nuevoStatus = input.checked;

    // Revertimos inmediatamente en la UI (para que no cambie hasta confirmar)
    input.checked = this.statusActivo;

    // Intentamos actualizar en backend
    this.actualizarAccesoUsuario(this.idUsuario ?? 0, nuevoStatus);
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
        this.getClienteData();
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
        if (inicio) this.router.navigate(['/vehicular/inicio']);
      }
    });
  }

  /* Mostrar inversiones del cliente */

  getInversionesLast() {
    this.skeletonShow = true;
    this.inversoresService.getInversionescliente(this.idUsuario ?? 0).pipe(
      finalize(() => this.skeletonShow = false)).
      subscribe((resp: any) => {
        if (resp.codigoMessage == Constantes.STATUS_SUCCESS_SV) {
          this.ultimasInversiones = resp.data;
          //this.ultimas10Inversiones = resp.data.slice(0, 10);
        }
        else {
          this.ultimasInversiones = [];
          //this.ultimas10Inversiones = [];
        }
      });
  }


  mostrarRegistros() {
    this.mostrarInversiones = !this.mostrarInversiones;
    if (this.mostrarInversiones) this.getInversionesLast();
  }

  /*   verRegistros() {
      sessionStorage.setItem('listallinv', JSON.stringify(this.ultimasInversiones));
      this.router.navigate(['/listacompleta']);
    }
   */

  formatNumberEspaciado(numero: string): string {
    try {
      return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } catch (error) {
      return "";
    }
  }

  copyCredentials() {
    this.copyText(this.clienteData.credenciales.correo, this.clienteData.credenciales.contrasena);
  }

  async copyText(correo: string, contra: string): Promise<void> {
    try {
      var nombreCompleto = this.clienteData.persona.nombres;
      var palabras = nombreCompleto.trim().split(' ');
      // Uso de la función
      var texto = palabras.length > 0 ? palabras[0] + ", usa estas credenciales para iniciar sesión en el sistema:\n\n" + "Correo: " + correo + "\n" + "Contraseña: " + contra : "Hola, usa estas credenciales para iniciar sesión en el sistema:\n\n" + "Correo: " + correo + "\n" + "Contraseña: " + contra;
      this.copyToClipboard(texto);
    } catch (err) {
      // Manejar el error si la operación de copia falla
      this.messageService.add({
        severity: 'error',
        summary: 'Copiar',
        detail: 'Error al copiar al portapapeles.',
        life: 3000
      });
    }
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (this.copy == false) this.copy = true;
      setTimeout(() => {
        this.copy = false;
      }, 3000);
    } catch (err) {
    }
  }


}
