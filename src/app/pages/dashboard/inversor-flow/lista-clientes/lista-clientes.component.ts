import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { finalize, catchError, of, delay } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { InversoresService } from '../../../../core/services/inversores/inversores.service';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, TabMenuModule, TabViewModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule,
    RouterModule],
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.scss'
})
export default class ListaClientesComponent {
  isLoading: boolean = true;
  forSkeleton: number = 10;
  listaClientes: any = [];
  listaClientesRecovery: any = [];
  totalClientes: number | null = 0;

  busqueda: string = '';
  filtroVacio: boolean = true;

  constructor(
    private inversoresService: InversoresService,
    private tempDataService: TempDataService,
    private router: Router
  ) { }

  persona: any = { idUsuario: null }

  ngOnInit(): void {

    this.obtenerListaClientes();
  }


  obtenerListaClientes() {
    this.inversoresService.getMyClients().pipe(
      finalize(() => this.isLoading = false),
      catchError((error) => {
        this.listaClientes = [];
        return of(null);
      })
    ).subscribe((resp: any) => {
      if (resp && resp.codigoMessage === Constantes.STATUS_SUCCESS_RI) {
        this.listaClientes = resp.data;
        this.listaClientesRecovery = resp.data;
        this.totalClientes = resp.totalRecord;
      }
    });
    this.filtrarCliente();
  }

  filtrarCliente() {
    const filtro = this.busqueda.trim().toLowerCase();

    if (filtro === '') {
      this.listaClientes = this.listaClientesRecovery;
      this.filtroVacio = false;
      return;
    }

    this.listaClientes = this.listaClientesRecovery.filter((item: any) => {
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
      `.toLowerCase();

      return textoBuscado.includes(filtro);
    });

    this.filtroVacio = this.listaClientes.length === 0;
  }

  formatNumberEspaciado(numero: string): string {
    if (numero != null) return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    else return ""
  }

  cleanFiltroFunct() {
    this.busqueda = '';
    this.filtrarCliente();
  }
}
