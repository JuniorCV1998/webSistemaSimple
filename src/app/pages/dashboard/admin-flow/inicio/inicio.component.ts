import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { delay, finalize } from 'rxjs';
import { LoginService } from '../../../../core/services/auth/login/login.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TabMenuModule, CommonModule, TableModule, LoadingComponent, SkeletonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

  nombreUsuario = '';

  /* Service mostrar datos */
  data: any = {
    totalInversores: 0,
    totalInversiones: 0
  }

  mostrarDatos: boolean = false;
  loading: boolean = false;

  constructor(
    private adminService: AdminService,
    private loginService: LoginService,
  ) {
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      
      const codTipoDoc = sessionStorage.getItem('codTipoDoc');
      if (codTipoDoc === "01" || codTipoDoc === null || codTipoDoc === "" || codTipoDoc === "null") {
        const fullName = decodedToken.nombre.split(" ");
        this.nombreUsuario = fullName[0];
      }else if (sessionStorage.getItem('codTipoDoc') === "06") {
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



}
