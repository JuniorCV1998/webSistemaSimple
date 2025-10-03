import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, throwError } from 'rxjs';
import { LongPressDirective } from '../../../../components/directives/long-press.directive';
import { Constantes } from '../../../../core/constant/Constantes';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { LoginService } from '../../../../core/services/auth/login/login.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TabMenuModule, CommonModule, TableModule, LoadingComponent, SkeletonModule, RouterModule, LongPressDirective,
    RouterLink, ConfirmDialogModule, ToastModule, ButtonModule, FormsModule, InputTextModule, FloatLabel],
  providers: [ConfirmationService, MessageService],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  nombreUsuario = '';

  /* Service mostrar datos */
  data: any = {
    totalInversores: 0,
    totalInversiones: 0
  }

  mostrarDatos: boolean = false;
  loading: boolean = false;

  /* Codigo Unico */
  codigosUnicos: any = [];
  mostrarCodUnicos: boolean = false;
  forSkeleton: number = 5;
  skeletonShow: boolean = true;
  codSelect: any = {};
  actualizarCorreo: boolean = false;
  rollbackCorreo: string = "";

  constructor(
    private adminService: AdminService,
    private loginService: LoginService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {

      const codTipoDoc = sessionStorage.getItem('codTipoDoc');
      if (codTipoDoc === "01" || codTipoDoc === null || codTipoDoc === "" || codTipoDoc === "null") {
        const fullName = decodedToken.nombre.split(" ");
        this.nombreUsuario = fullName[0];
      } else if (sessionStorage.getItem('codTipoDoc') === "06") {
        this.nombreUsuario = sessionStorage.getItem('nombreComercial') ?? sessionStorage.getItem('razonSocial') ?? "";
      }
    }
  }

  mostrarDatosFunct() {
    this.mostrarDatos = !this.mostrarDatos;

    if (this.mostrarDatos) {
      this.loading = true;
      this.adminService.dashboard().pipe(
        finalize(() => this.loading = false)).
        subscribe((resp: any) => {
          this.data.totalInversores = resp.totalInversores;
          this.data.totalInversiones = resp.totalInversiones;
        });
    }
  }

  mostrarCodUnico() {
    this.mostrarCodUnicos = !this.mostrarCodUnicos;
    this.skeletonShow = true;

    this.adminService.getCodigosUnicos("LIMIT").pipe(
      finalize(() => this.skeletonShow = false)).
      subscribe((resp: any) => {
        this.codigosUnicos = resp;
      });
  }

  pressOn(correo: string) {
    this.actualizarCorreo = true;
    this.rollbackCorreo = correo;
  }

  updateCorreoService(codigoObj: any) {
    this.updateCorreo(codigoObj).then((result) => {
      if (result) {
        this.loadingComponent.show();
        this.adminService.updateCorreoDeCodigoUnico(codigoObj.codigo, codigoObj.correo).pipe(
          finalize(() => this.loadingComponent.hide()),
          catchError((error) => {
            this.codSelect.correo = this.rollbackCorreo;
            const messageData = {
              severity: 'info',
              summary: Constantes.MSG_SERVICE_UPS,
              detail: error.error.descripcion,
              life: 5000
            };
            this.messageService.add(messageData);
            return throwError(() => error);
          })
        ).subscribe((resp: any) => {
          const messageData = {
            severity: 'success',
            summary: Constantes.MSG_SERVICE_UPDATE,
            detail: resp.descripcion,
            life: 3000
          };
          this.messageService.add(messageData);
        });
      }
    });
  }

  updateCorreo(codigoObj: any): Promise<boolean> {
    this.codSelect = codigoObj;
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'update_correo',
        header: 'Código Único',
        closeOnEscape: false,
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          this.codSelect.correo = this.rollbackCorreo;
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }

  isFormValid(): boolean {
    return (
      this.codSelect.correo !== null && this.codSelect.correo !== ""
    );
  }

}
