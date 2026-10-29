import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { InversoresService } from '../../../core/services/inversores/inversores.service';
import { TempDataService } from '../../../core/services/temp-data.service';
import { FlowStepsComponent } from '../../../components/resources/flow-steps/flow-steps.component';
import { PASOS_PRESTAMO, PASOS_VEHICULAR } from '../../../core/utils/flujos';
import { celularParaMostrar } from '../../../core/utils/documento-pais';


@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, SkeletonModule,
    RouterModule, FlowStepsComponent
  ],
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
    if(numero!=null) return numero.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    else return ""
  }

  /** En el flujo vehicular este es el paso 1; en el de préstamo, el 2. */
  get esVehicular(): boolean {
    return this.tempDataService.hasItem('flow') && this.tempDataService.getItem<any>('flow') === 'vehicular';
  }

  get pasos(): string[] { return this.esVehicular ? PASOS_VEHICULAR : PASOS_PRESTAMO; }
  get pasoActual(): number { return this.esVehicular ? 1 : 2; }

  iniciales(persona: any): string {
    const n = (persona?.nombres || '').trim().charAt(0);
    const a = (persona?.apellidoPaterno || '').trim().charAt(0);
    return (n + a).toUpperCase() || '?';
  }

  celular(persona: any): string {
    return celularParaMostrar(persona?.celular, persona?.codPais);
  }

  cleanFiltroFunct() {
    this.busqueda = '';
    this.filtrarCliente();
  }

}
