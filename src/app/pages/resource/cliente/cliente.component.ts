import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { InversoresService } from '../../../core/services/inversores/inversores.service';
import { TempDataService } from '../../../core/services/temp-data.service';


@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule,TabMenuModule, TabViewModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export default class ClienteComponent {

  isLoading: boolean = true;
  forSkeleton: number = 5;
  listaClientes: any = [];
  listaClientesRecovery: any = [];

  busqueda: string = '';
  filtroVacio: boolean = true;

constructor(
  private inversoresService: InversoresService,
  private tempDataService: TempDataService,
  private router: Router
){}

persona: any = { idUsuario: null }
  
ngOnInit(): void{
  if(!this.tempDataService.hasItem('flow')) this.router.navigate(['inicio']);
  this.obtenerListaClientes();
}


  obtenerListaClientes(){
        this.inversoresService.getMyClients().pipe(
        finalize(() => this.isLoading = false ),
        catchError((error) => {
            this.listaClientes = [];
        return of(null); 
        })
        ).subscribe((resp: any) => {
            if (resp && resp.codigoMessage === Constantes.STATUS_SUCCESS_RI) {
                this.listaClientes = resp.data;
                this.listaClientesRecovery = resp.data;
            }
        });
        this.filtrarCliente();
  }

  seleccionarCliente(idUsuario: number){
    // esta seleccionando al siguiente usuario
    this.persona.idUsuario = idUsuario;
    this.tempDataService.setItem('persona',this.persona);
    //if(this.persona!=null) this.router.navigate(['vehicular/registro/datosinversion']);
    
    if(this.tempDataService.hasItem('flow')) {
      let temp = this.tempDataService.getItem<any>('flow');
      if(temp==='vehicular') this.router.navigate(['vehicular/registro/datosinversion']);
      else if(temp==='prestamo') this.router.navigate(['registrar/confirmar']);
      else this.router.navigate(['inicio']);
    } else this.router.navigate(['inicio']);
  }

  filtrarCliente(){
    const filtro = this.busqueda.toLowerCase();
    if(filtro==''){
      this.listaClientes = this.listaClientesRecovery;
      this.filtroVacio = false;
      return;
    }
    const personasFiltradas = this.listaClientesRecovery.filter((item: any) =>
      item.persona.nombres.toLowerCase().includes(filtro) || item.persona.apellidoPaterno.toLowerCase().includes(filtro) ||
      item.persona.apellidoMaterno.toLowerCase().includes(filtro) || item.persona.celular.toLowerCase().includes(filtro)
    );
    this.listaClientes = personasFiltradas; 
    if(personasFiltradas.length==0) this.filtroVacio = true;
    else this.filtroVacio = false;
  }

  formatNumberEspaciado(numero: string): string {
    if(numero!=null) return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    else return ""
  }

  cleanFiltroFunct() {
    this.busqueda = '';
    this.filtrarCliente();
  }

}
