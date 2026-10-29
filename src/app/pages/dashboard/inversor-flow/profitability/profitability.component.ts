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
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';

@Component({
  selector: 'app-profitability',
  standalone: true,
  imports: [TabMenuModule, RouterLink, ButtonModule, CommonModule, ChartModule, TableModule, ConfirmDialogModule, LoadingComponent,
    FormatNumberPipe],
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
  /** Rango de la vista mensual: últimos 6 o 12 meses. */
  meses: number = 6;

  /** Fila del período vigente (hoy si es vista diaria, mes en curso si es vista mensual):
   *  se usa para destacar sus valores en las tarjetas KPI, sin inventar sumas nuevas sobre datos financieros. */
  get filaActual(): any {
    return this.rentabilidadData.find(row => row.mesActual) ?? null;
  }

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
      const css = getComputedStyle(document.documentElement);
      const color = (v: string) => css.getPropertyValue(v).trim();
      const azul = color('--blue-400');
      const verde = color('--primary-500');
      const gris = color('--gray-500');
      const grid = color('--gray-100');
      const moneda = this.currency ?? '';
      const fmt = (n: number) => Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const compacto = (n: number) => Math.abs(n) >= 1000 ? (n / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'k' : String(n);
      // El canvas no entiende color-mix: se pasa el hex del tema a rgba
      const tenue = (hex: string, a: number) => {
        const h = hex.replace('#', '');
        const [r, g, b] = [0, 2, 4].map(i => parseInt(h.substring(i, i + 2), 16));
        return h.length === 6 ? `rgba(${r}, ${g}, ${b}, ${a / 100})` : hex;
      };

      this.data = {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Rentabilidad',
            data: rentabilidad,
            borderColor: verde,
            backgroundColor: verde,
            borderWidth: 2.5,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#fff',
            pointBorderColor: verde,
            pointBorderWidth: 2,
            order: 0
          },
          {
            type: 'bar',
            label: 'Capital',
            data: capital,
            backgroundColor: tenue(azul, 75),
            hoverBackgroundColor: azul,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 14,
            order: 1
          },
          {
            type: 'bar',
            label: 'Cobrado',
            data: cobros,
            backgroundColor: tenue(verde, 45),
            hoverBackgroundColor: verde,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 14,
            order: 1
          }
        ]
      };

      this.options = {
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: gris, usePointStyle: true, pointStyle: 'circle', boxWidth: 7, boxHeight: 7, padding: 16, font: { size: 11, weight: 600 } }
          },
          tooltip: {
            backgroundColor: '#fff',
            titleColor: color('--gray-700'),
            bodyColor: gris,
            borderColor: grid,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 12,
            usePointStyle: true,
            boxPadding: 4,
            callbacks: { label: (c: any) => ` ${c.dataset.label}: ${moneda} ${fmt(c.parsed.y)}` }
          }
        },
        scales: {
          x: {
            // Vista mensual con más de 6 meses: un mes sí y otro no, empezando por el último (el actual);
            // el tooltip sigue mostrando todos. La vista diaria deja que Chart.js salte etiquetas solo.
            ticks: {
              color: gris, font: { size: 10.5 }, maxRotation: 0, autoSkip: this.actual,
              callback: (_: any, i: number) =>
                this.actual || labels.length <= 6 || (labels.length - 1 - i) % 2 === 0 ? labels[i] : ''
            },
            grid: { display: false },
            border: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: gris, font: { size: 10.5 }, maxTicksLimit: 5, callback: (v: number) => compacto(v) },
            grid: { color: grid },
            border: { display: false }
          }
        }
      };
      this.cd.markForCheck();
    }
  }

  changeOpen(status: boolean, meses: number = 6) {
    this.actual = status;
    if (!status) this.meses = meses;

    const hoy = new Date();

    // Mes actual
    const fin = hoy.toISOString().slice(0, 7);

    let inicio: string;

    if (this.actual) {
      // Solo mes actual
      inicio = fin;
    } else {
      // Últimos 6 o 12 meses incluyendo actual (día 1 para que setMonth no se desborde en meses cortos)
      const mesesAtras = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      mesesAtras.setMonth(mesesAtras.getMonth() - (this.meses - 1));

      inicio = `${mesesAtras.getFullYear()}-${String(mesesAtras.getMonth() + 1).padStart(2, '0')}`;
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
