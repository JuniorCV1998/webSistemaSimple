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
  ultimas10Inversiones: any[] = [];
  isMore10: boolean = false;

  ngOnInit() {
    
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
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI) {
        //this.ultimasInversiones = resp.data.slice(0, 10);
        this.ultimasInversiones = resp.data;
        this.ultimas10Inversiones = resp.data.slice(0, 10);
      }
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
    sessionStorage.setItem('listallinv',JSON.stringify(this.ultimasInversiones));
    this.router.navigate(['/listacompleta']);
  }


}
