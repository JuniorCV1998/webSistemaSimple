import { Component, ViewChild } from '@angular/core';
import { CollectionReport } from '../../../interfaces/collection-report/collection-report';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { ListEmptyNoneComponent } from '../../../components/resources/list-empty-none/list-empty-none.component';
import { GetInversionService } from '../../../core/services/inversion/get-inversion.service';
import { LoadingComponent } from '../../modal/loading/loading.component';
import { delay, finalize } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';

@Component({
  selector: 'app-collection-report',
  standalone: true,
  imports: [TableModule, CommonModule, TabMenuModule, ListEmptyNoneComponent, LoadingComponent],
  templateUrl: './collection-report.component.html',
  styleUrl: './collection-report.component.scss'
})
export default class CollectionReportComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;

  /* lista mayor a 5, diarios y Semanal */
  mostrarTodo: boolean = false;
  mostrarTodoS: boolean = false;

  /* lista - data */
  data: CollectionReport = {
    reportDiario: {
      lista: [],
      totalCuotas: 0
    },
    reportSemanal: [],
    amountCharged: 0
  };

  constructor(
    private getInversionService: GetInversionService
  ){}

  ngOnInit(): void{
  }

  ngAfterViewInit(): void{
    this.getReportCollection();
  }

  getReportCollection(){
    this.loadingComponent.show();
    this.getInversionService.getReportCollection().pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
    ).
    subscribe((resp: any)=> {
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI) {
        this.data = resp.data;
      }
    });
  }

  // Método para alternar la visualización
  toggleMostrar() {
    this.mostrarTodo = !this.mostrarTodo;
  }
  toggleMostrarS() {
    this.mostrarTodoS = !this.mostrarTodoS;
  }


}

