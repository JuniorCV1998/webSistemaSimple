import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { catchError, finalize, of, throwError } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { ErrorGeneralComponent } from '../../../system/errores/error-general/error-general.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inversores-inversiones',
  standalone: true,
  imports: [CommonModule, TabMenuModule, TabViewModule, InputTextModule, ButtonModule, SkeletonModule, MessageModule,
    FormsModule, SelectButtonModule, ErrorGeneralComponent, RouterModule
  ],
  templateUrl: './inversores-inversiones.component.html',
  styleUrl: './inversores-inversiones.component.scss'
})
export default class InversoresInversionesComponent {

  isLoading: boolean = true;
  forSkeleton: number = 5;
  listaInversores: any = [];
  listaInversoresRecovery: any = [];
  descripcion: string = '';

  busqueda: string = '';
  filtroVacio: boolean = true;

  /* Filtros */
  open: string = "";
  datosServicio: boolean = false; // si hay datos, mostrar filtro

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.obtenerListaInversores();
  }

  /* Mensaje de error */
  errorBody: string = '';
  mostrarError: boolean = false;



  obtenerListaInversores() {
    this.isLoading = true;

    this.adminService.getInversoresList().pipe(
      finalize(() => this.isLoading = false),
      catchError((error) => {
        // Configuro el mensaje dinámico
        this.errorBody = error.error?.message;
        this.mostrarError = true;

        this.listaInversores = [];
        this.listaInversoresRecovery = [];
        return throwError(() => error);
      })
    ).subscribe((resp: any) => {
      if (resp?.codigo === Constantes.STATUS_SUCCESS_SV) {
        this.descripcion = resp.descripcion;
        this.listaInversores = resp.data;
        this.listaInversoresRecovery = resp.data;
        this.mostrarError = false;
        if (resp?.data.length > 0) this.datosServicio = true; // representa que hay datos, mostrar filtro
      }
    });
  }


  seleccionarCliente(idUsuario: number) {
    // esta seleccionando al siguiente usuario
    /* this.persona.idUsuario = idUsuario;
    this.tempDataService.setItem('persona',this.persona);
    //if(this.persona!=null) this.router.navigate(['vehicular/registro/datosinversion']);
    
    if(this.tempDataService.hasItem('flow')) {
      let temp = this.tempDataService.getItem<any>('flow');
      if(temp==='vehicular') this.router.navigate(['vehicular/registro/datosinversion']);
      else if(temp==='prestamo') this.router.navigate(['registrar/confirmar']);
      else this.router.navigate(['inicio']);
    } else this.router.navigate(['inicio']); */
  }

  UsingFilter(valueFilter: string) {
    // Si no hay recovery, evitar errores
    const original = Array.isArray(this.listaInversoresRecovery) ? this.listaInversoresRecovery : [];
    // Toggle: si ya está abierto, restaurar y salir
    if (this.open === valueFilter) {
      this.open = '';
      // Restaurar una copia para no compartir referencia
      this.listaInversores = [...original];
      return;
    }
    // Activar el filtro
    this.open = valueFilter;
    // Filtrar siempre desde la lista original
    switch (valueFilter) {
      case 'N':
        this.listaInversores = original.filter((item: any) => item.acceso === 'N');
        break;

      case 'P':
        // "Por vencer": días entre 1 y 3
        this.listaInversores = original.filter((item: any) => {
          const dias = Number(item.diasRestantes);
          return Number.isFinite(dias) && dias > 0 && dias <= 3;
        });
        break;

      case 'V':
        // Vencidos
        this.listaInversores = original.filter((item: any) =>
          typeof item.diasRestantes === 'number' && item.diasRestantes === 0
        );
        break;

      default:
        // Sin filtro, devolver copia de original
        this.listaInversores = [...original];
    }
  }

  filtrarInversor() {
    const filtro = this.busqueda.trim().toLowerCase();
    this.open = '';

    if (filtro === '') {
      this.listaInversores = this.listaInversoresRecovery;
      this.filtroVacio = false;
      return;
    }

    this.listaInversores = this.listaInversoresRecovery.filter((item: any) => {
      const persona = item.persona;
      const textoBuscado = `
          ${persona.nombres} 
          ${persona.apellidoPaterno} 
          ${persona.apellidoMaterno} 
          ${persona.nombres} ${persona.apellidoPaterno} 
          ${persona.nombres} ${persona.apellidoMaterno} 
          ${persona.apellidoPaterno} ${persona.apellidoMaterno} 
          ${persona.nombres} ${persona.apellidoPaterno} ${persona.apellidoMaterno} 
          ${persona.celular}
          ${persona.nroDocumento}
        `.toLowerCase();

      return textoBuscado.includes(filtro);
    });

    this.filtroVacio = this.listaInversores.length === 0;
  }

  cleanFiltroFunct() {
    this.busqueda = '';
    this.filtrarInversor();
  }

  formatNumberEspaciado(numero: string): string {
    if (numero != null) return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    else return ""
  }

}