import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TabMenuModule } from 'primeng/tabmenu';
import { DialogRenovarMembresiaComponent } from '../../../modal/dialog-renovar-membresia/dialog-renovar-membresia.component';
import { SystemService } from '../../../../core/services/system/system.service';
import { App } from '@capacitor/app';
import { Observable } from 'rxjs';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-update-app',
  standalone: true,
  imports: [TabMenuModule, ButtonModule, ConfirmDialogModule, MessageModule, CommonModule],
  providers: [ConfirmationService],
  templateUrl: './update-app.component.html',
  styleUrl: './update-app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UpdateAppComponent {
  @Input() header: string = 'Actualización disponible';
  @Input() body: string = 'Hay información que requiere tu revisión.';

  /* Número de celular */
  nroCelular = "920605673";
  opcionSeleccionada: any = null;

  /* URL Store */
  urlPlayStore: string = '';
  appVersion = '';

  /* version */
  respVersion: any = {};

  constructor(
    private router: Router,
    private systemService: SystemService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { respVersion?: any };

    if (state?.respVersion) {
      this.respVersion = state.respVersion;
    }

    this.respVersion = this.config.data.respVersion;
  }

  ngOnInit(): void {
    this.consultarURLPlayStore();
  }

  ngAfterViewInit(): void {
    //this.versionApp();
  }


  /* versionApp(): Observable<any> {
    return this.systemService.versionAnd(this.appVersion);
  } */


  consultarURLPlayStore() {
    this.systemService.urlStore().subscribe({
      next: (response: any) => {
        this.urlPlayStore = response[0].descripcion;
      },
      error: err => {
        this.urlPlayStore = 'https://play.google.com/store/apps/details?id=com.ssimple.app';
      }
    });
  }

  solicitarPorWhatsapp(opcion: any) {
    const mensaje = encodeURIComponent(
      `¡Hola! Me gustaría renovar mi membresía con el plan de ${opcion.label} por S/${opcion.precio}.`
    );
    window.open(`https://wa.me/51${this.nroCelular}?text=${mensaje}`, '_blank');
  }

  continuar() {
    //this.router.navigate(['/inicio']);
    this.ref.close(true);
  }

  actualizarApp() {
    window.open(this.urlPlayStore, '_blank');
    //this.router.navigate(['/login']);
    this.ref.close(false);
  }

}
