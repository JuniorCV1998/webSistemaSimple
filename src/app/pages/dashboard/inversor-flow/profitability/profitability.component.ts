import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ChartModule } from 'primeng/chart';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { catchError, finalize, of } from 'rxjs';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { TableModule } from 'primeng/table';
import { TempDataService } from '../../../../core/services/temp-data.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-profitability',
  standalone: true,
  imports: [TabMenuModule, RouterLink, ButtonModule, CommonModule, ChartModule, TableModule, ConfirmDialogModule,LoadingComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './profitability.component.html',
  styleUrl: './profitability.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export default class ProfitabilityComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  rentabilidadService: boolean = true;

  data: any;
  options: any;

  platformId = inject(PLATFORM_ID);

  products!: any[];
  rentabilidadData: any[] = [];

  currency: string | null = null;

  actual: boolean = false;

  constructor(
    private cd: ChangeDetectorRef,
    private getInversionService: GetInversionService,
    private tempDataService: TempDataService,
    private confirmationService: ConfirmationService,
  ) {
    this.currency = this.tempDataService.getConstant('currency') || 'S/';
  }

  ngOnInit() {
    //this.getRentabilidad();
    //this.changeOpen(false);
  }

  ngAfterViewInit(): void {
    this.changeOpen(false);
  }

  getRentabilidad(inicio: string, fin: string) {
    this.loadingComponent.show();
    this.getInversionService.getRentabilidadInversion(inicio, fin).pipe(
      finalize(() => {
        this.loadingComponent.hide();
      }),
      // Manejamos errores de respuesta HTTP con catchError
      catchError((error) => {
        this.rentabilidadService = false;
        // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
        return of(null);
      })
    ).
      subscribe((resp: any) => {
        if (!resp) return;

        if(resp.length == 0){
          this.rentabilidadService = false;
          return;
        }

        if (!this.actual) {
          const labels = resp.map((x: any) =>
            x.nombreMes.charAt(0).toUpperCase() + x.nombreMes.slice(1)
          );

          const rentabilidad = resp.map((x: any) => x.rentabilidadAcumulada);
          const capital = resp.map((x: any) => x.capitalInvertido);
          const cobros = resp.map((x: any) => x.montoCobrado);

          this.initChart(labels, rentabilidad, capital, cobros);
          this.rentabilidadData = resp.reverse();
        } else {
          const labels = resp.map((x: any) =>
            x.fecha.charAt(0).toUpperCase() + x.fecha.slice(1)
          );

          const rentabilidad = resp.map((x: any) => x.rentabilidadObtenida);
          const capital = resp.map((x: any) => x.capitalInvertido);
          const cobros = resp.map((x: any) => x.montoCobrado);

          this.initChart(labels, rentabilidad, capital, cobros);
          this.rentabilidadData = resp.reverse();
        }


      }

      );
  }

  initChart(labels: string[], rentabilidad: number[], capital: number[], cobros: number[]) {
    if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.data = {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Rentabilidad',
            borderColor: documentStyle.getPropertyValue('--primary-500'),
            backgroundColor: 'white',
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            data: rentabilidad
          },
          {
            type: 'bar',
            label: 'Capital',
            backgroundColor: documentStyle.getPropertyValue('--blue-300'),
            data: capital,
            borderColor: 'white',
            borderWidth: 2
          },
          {
            type: 'bar',
            label: 'Cobros',
            backgroundColor: documentStyle.getPropertyValue('--primary-300'),
            data: cobros
          }
        ]
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.9,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder
            }
          }
        }
      };
      this.cd.markForCheck();
    }
  }

  changeOpen(status: boolean) {
    this.actual = status;

    const hoy = new Date();

    // Mes actual
    const fin = hoy.toISOString().slice(0, 7);

    let inicio: string;

    if (this.actual) {
      // Solo mes actual
      inicio = fin;
    } else {
      // Últimos 6 meses incluyendo actual
      const seisMesesAtras = new Date(hoy);
      seisMesesAtras.setMonth(hoy.getMonth() - 5);

      inicio = seisMesesAtras.toISOString().slice(0, 7);
    }

    this.getRentabilidad(inicio, fin);

  }

  modalTerminos(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'terminos',
        header: 'Te aclaramos algunos términos',
        message: '',
        accept: () => {
          resolve(true);  // Resuelve la promesa con "true" si acepta
        },
        reject: () => {
          resolve(false); // Resuelve la promesa con "false" si rechaza
        }
      });
    });
  }
}
