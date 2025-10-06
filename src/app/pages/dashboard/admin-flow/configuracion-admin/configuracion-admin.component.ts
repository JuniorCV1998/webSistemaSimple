import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputNumber } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { catchError, finalize, throwError } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { ErrorGeneralComponent } from '../../../system/errores/error-general/error-general.component';

@Component({
  selector: 'app-configuracion-admin',
  standalone: true,
  imports: [ToastModule, FormsModule, InputNumber, ErrorGeneralComponent, CommonModule, LoadingComponent,
    ToggleSwitch, ButtonModule, MessageModule
  ],
  providers: [ConfirmationService, MessageService,],
  templateUrl: './configuracion-admin.component.html',
  styleUrl: './configuracion-admin.component.scss'
})
export default class ConfiguracionAdminComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  /* Estado del usuario */
  statusActivo: boolean = false;
  /* Periodo de prueba */
  nroMeses: number = 0;

  /* Mensaje de error */
  errorBody: string = '';
  mostrarError: boolean = false;

  /* Objetos */
  webPublic: any = {};
  periodTest: any = {};
  mantenimiento: any = {};
  originalValues: any = {}; // para guardar los valores iniciales
  changedValues: any[] = [];

  checked: boolean = false;

  constructor(
    private adminService: AdminService,
    public dialogService: DialogService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {

    setTimeout(() => {
      this.loadingComponent.show();
      this.getConfiguracionAdmin();
    }, 100);

  }

  getConfiguracionAdmin() {
    this.loadingComponent.show();
    this.adminService.getConfiguracionAdmin().pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError((error) => {
        // Configuro el mensaje dinámico
        this.errorBody = error.error?.descripcion;
        this.mostrarError = true;

        return throwError(() => error);
      })
    ).subscribe((resp: any) => {
      resp.forEach((element: any) => {
        switch (element.codConfiguration) {
          case 'SITE_WEB':
            this.webPublic = element;
            break;
          case 'MES_FREE':
            this.periodTest = element;
            break;
          case 'MANT_MODE':
            this.mantenimiento = element;
            break;
        }
      });
      this.changedValues = [];
      this.originalValues = {
        SITE_WEB: { ...this.webPublic },
        MES_FREE: { ...this.periodTest },
        MANT_MODE: { ...this.mantenimiento }
      };
    });
  }

  onValueChange(codConfig: string, newValue: any) {
    const original = this.originalValues[codConfig];
    if (!original) return;

    if (original.value !== newValue) {
      const changed = { codConfiguration: codConfig, value: newValue };
      const index = this.changedValues.findIndex(c => c.codConfiguration === codConfig);
      if (index > -1) {
        this.changedValues[index] = changed;
      } else {
        this.changedValues.push(changed);
      }
    } else {
      this.changedValues = this.changedValues.filter(c => c.codConfiguration !== codConfig);
    }
  }


  updateConfigAdmin() {
    this.loadingComponent.show();
    this.adminService.updateConfiguracionAdmin(this.changedValues).pipe(
      finalize(() => this.loadingComponent.hide()),
      catchError((error) => {
        const messageData = {
          severity: 'error',
          summary: Constantes.MSG_SERVICE_ERROR,
          detail: error.error.descripcion,
          life: 3000
        };
        this.messageService.add(messageData);

        return throwError(() => error);
      })
    ).subscribe((resp: any) => {
      const messageData = {
        severity: 'success',
        summary: Constantes.MSG_SERVICE_UPDATE,
        detail: Constantes.MSG_SERVICE_DESC_UPDATE,
        life: 3000
      };
      this.messageService.add(messageData);

      // Refrescar valores originales
      this.changedValues.forEach(change => {
        if (this.originalValues[change.codConfiguration]) {
          this.originalValues[change.codConfiguration].value = change.value;
        }
      });

      this.changedValues = [];

    });
  }

}
