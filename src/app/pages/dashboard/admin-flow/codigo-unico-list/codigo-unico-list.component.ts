import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { catchError, delay, finalize, throwError } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LongPressDirective } from '../../../../components/directives/long-press.directive';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { Constantes } from '../../../../core/constant/Constantes';

@Component({
  selector: 'app-codigo-unico-list',
  standalone: true,
  imports: [SkeletonModule, RouterLink, CommonModule, LongPressDirective, ButtonModule, ConfirmDialogModule,
    ToastModule, ButtonModule, FormsModule, InputTextModule, FloatLabel,LoadingComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './codigo-unico-list.component.html',
  styleUrl: './codigo-unico-list.component.scss',
})
export default class CodigoUnicoListComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  /* Codigo Unico */
  codigosUnicos: any = [];
  mostrarCodUnicos: boolean = false;
  forSkeleton: number = 10;
  skeletonShow: boolean = true;
  codSelect: any = {};
  actualizarCorreo: boolean = false;
  rollbackCorreo: string = "";

  constructor(
    private adminService: AdminService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.listarCodUnico();
  }

  listarCodUnico() {
    this.mostrarCodUnicos = !this.mostrarCodUnicos;
    this.skeletonShow = true;
    this.adminService.getCodigosUnicos("ALL").pipe(
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
        console.log("Entro?")
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
