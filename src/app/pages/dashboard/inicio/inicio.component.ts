import { Component, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { CommonModule, ViewportScroller } from '@angular/common'; // Importa CommonModule
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';
import { delay, finalize } from 'rxjs';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { GetInversionService } from '../../../core/services/inversion/get-inversion.service';
import { Constantes } from '../../../core/constant/Constantes';
import { SkeletonModule } from 'primeng/skeleton';
import { LoginService } from '../../../core/services/auth/login/login.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TabMenuModule,CommonModule,TableModule,LoadingComponent,SkeletonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  
  forSkeleton: number = 5;
  skeletonShow: boolean = true;

  nombreUsuario = '';

  constructor(
    private router: Router,
    private getInversionService: GetInversionService,
    private viewportScroller: ViewportScroller,
    private loginService: LoginService
  ){
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      const fullName = decodedToken.nombre.split(" ");
      this.nombreUsuario = fullName[0];
    }
  }

  items: MenuItem[] | undefined;
  monto: any = 0;
  montoCargado: boolean = false;
  mostrar: boolean = false;

  ultimasInversiones: any[] = [];
  ultimas10Inversiones: any[] = [];
  isMore10: boolean = false;

  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.clearSessionStorageExcept(['token', '']);
  }

  ngAfterViewInit() {
    this.getInversionesLast();
  }

  getAmount(){
    this.montoCargado = false;
    this.getInversionService.getAmount().pipe(delay(300),finalize(() => this.montoCargado = true)).
    subscribe((resp: any)=> {
      if(resp.codigo==Constantes.STATUS_SUCCESS_RI) this.monto = resp.monto;
      else {
        this.monto = 'x';
      }
    } );
  }

  getInversionesLast(){
    this.skeletonShow = true;
    this.getInversionService.getInversionesLast().pipe(delay(300),finalize(() => this.skeletonShow = false)).
    subscribe((resp: any)=> {
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI) {
        //this.ultimasInversiones = resp.data.slice(0, 10);
        this.ultimasInversiones = resp.data;
        this.ultimas10Inversiones = resp.data.slice(0, 10);
      }
      else {
        this.ultimasInversiones = [];
        this.ultimas10Inversiones = [];
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

  clearSessionStorageExcept(keysToKeep: string[]) {
    // Guardar las claves y valores que no se deben eliminar
    const valuesToKeep: { [key: string]: string | null } = {};
  
    keysToKeep.forEach((key) => {
      const value = sessionStorage.getItem(key);
      if (value !== null) {
        valuesToKeep[key] = value;
      }
    });
  
    // Limpiar todo el sessionStorage
    sessionStorage.clear();
  
    // Restaurar los valores que queremos conservar
    Object.keys(valuesToKeep).forEach((key) => {
      sessionStorage.setItem(key, valuesToKeep[key]!);
    });
  }

}
