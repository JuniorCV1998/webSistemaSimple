import { Component, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { delay, finalize } from 'rxjs';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { GetAmountService } from '../../../core/services/inversion/get-inversion.service';
import { Constantes } from '../../../core/constant/Constantes';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TabMenuModule,CommonModule,TableModule,LoadingComponent,SkeletonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export default class InicioComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  
  forSkeleton: number = 5;
  skeletonShow: boolean = true;

  constructor(
    private router: Router,
    private getAmountService: GetAmountService
  ){}

  items: MenuItem[] | undefined;
  monto: any = 0;
  montoCargado: boolean = false;
  mostrar: boolean = false;

  ultimasInversiones: any[] = [];

  ngOnInit() {
    //this.ultimasInversiones = this.data;
  }

  ngAfterViewInit() {
    this.getInversionesLast();
  }

  getAmount(){
    this.montoCargado = false;
    this.getAmountService.getAmount().pipe(delay(500),finalize(() => this.montoCargado = true)).
    subscribe((resp: any)=> {
      if(resp.codigo==Constantes.STATUS_SUCCESS_RI) this.monto = resp.monto;
      else {
        this.monto = 'x';
      }
    } );
  }

  getInversionesLast(){
    this.skeletonShow = true;

    this.getAmountService.getInversionesLast().pipe(delay(500),finalize(() => this.skeletonShow = false)).
    subscribe((resp: any)=> {
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI) this.ultimasInversiones = resp.data;
      else {
        this.monto = 'x';
      }
    } );
  }

  mostrarMonto(){
    this.mostrar = !this.mostrar;
    if(this.mostrar) this.getAmount();
  }

  verRegistros(){
    if(this.ultimasInversiones.length == 0){
      alert("No se encontraron registros. Por favor, actualice.")
    }
  }

/*   routerInversion(){
    this.router.navigate(['/inversion']);
  } */
  
  data = [
  {id:1, nombre: 'Jose Cerron Vicente', fecha: 'Hoy - 16:08 p.m.', monto: '1200.00'},
  {id:2, nombre: 'Alfredo Quispe Vicente', fecha: 'Hoy - 13:08 p.m.', monto: '1000.00'},
  {id:3, nombre: 'Angeles Casas Mia', fecha: 'Hoy - 10:08 a.m.', monto: '500.00'},
  {id:4, nombre: 'Junior Cerron Quispe', fecha: 'Ayer - 16:08 p.m.', monto: '750.00'},
  {id:5, nombre: 'Miguel Quispe Casas', fecha: 'Ayer - 16:08 p.m.', monto: '5000.00'},
  {id:6, nombre: 'William Sanchez Sanchez', fecha: '08 de feb. 2024 - 16:08 p.m.', monto: '10000.00'},
  {id:7, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  {id:8, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  {id:9, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  {id:10, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  ]
}
