import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../core/constant/Constantes';
import { FormatNumberPipe } from '../../../core/pipes/format-number.pipe';
import { TwoDigitsPipe } from '../../../core/pipes/two-digits.pipe';
import { InversionVehService } from '../../../core/services/inversion-veh/inversion-veh.service';
import { TempDataService } from '../../../core/services/temp-data.service';

interface CronogramaItem {
  nroCuota: number;
  fechaCierre: string;
  diasCuota: number;
  montoCuota: number;
  pagado: boolean;
}

interface CronogramaGrupo {
  label: string;
  items: CronogramaItem[];
  montoGrupo: number;
}

const MESES: Record<string, string> = {
  ene: 'Enero', feb: 'Febrero', mar: 'Marzo', abr: 'Abril', may: 'Mayo', jun: 'Junio',
  jul: 'Julio', ago: 'Agosto', set: 'Septiembre', sep: 'Septiembre', oct: 'Octubre',
  nov: 'Noviembre', dic: 'Diciembre'
};

@Component({
  selector: 'app-cronograma-pago',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule, FormatNumberPipe, TwoDigitsPipe],
  templateUrl: './cronograma-pago.component.html',
  styleUrl: './cronograma-pago.component.scss'
})
export default class CronogramaPagoComponent {

  idInversionVeh: number = 0;
  invDetail: any = {};
  currency: string = 'S/';
  pathLogo: string | null = null;
  perfil: string = '';

  isLoading: boolean = true;
  isGeneratingPdf: boolean = false;
  mostrarBotonSubir: boolean = false;

  grupos: CronogramaGrupo[] = [];
  totalCuotas: number = 0;
  totalMonto: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private inversionVehService: InversionVehService,
    private tempDataService: TempDataService,
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { invDetail?: any };
    if (state?.invDetail) this.invDetail = state.invDetail;

    this.currency = this.tempDataService.getConstant('currency') || 'S/';
    if (this.tempDataService.hasConstant('codPerfil')) this.perfil = this.tempDataService.getConstant('codPerfil') ?? '';

    /* Cargar Logo y Sello */
    const logoGuardado = sessionStorage.getItem('pathLogo');
    this.pathLogo = logoGuardado && logoGuardado !== 'null' ? logoGuardado : 'public/logos/logo_ssimple.png';
  }

  get mostrarMontosAgregados(): boolean {
    return this.perfil === Constantes.PERFIL_INV;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.mostrarBotonSubir = window.scrollY > 400;
  }

  irArriba() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversionVeh');
      this.idInversionVeh = id ? +id : 0;
    });

    // Si se navegó directo (o se refrescó la página) no tendremos el invDetail por state; lo recuperamos.
    if (!this.invDetail?.fullName) this.getInvDetail();

    this.getCronograma();
  }

  getInvDetail() {
    this.inversionVehService.getInversionVehDetail(this.idInversionVeh).subscribe((resp: any) => {
      if (resp?.data) this.invDetail = resp.data;
    });
  }

  getCronograma() {
    this.isLoading = true;
    this.inversionVehService.getCronogramaPagoVeh(this.idInversionVeh).pipe(
      finalize(() => this.isLoading = false),
      catchError(() => of(null))
    ).subscribe((resp: any) => {
      const data: any[] = resp?.data ?? [];
      this.procesarCronograma(data);
    });
  }

  private procesarCronograma(data: any[]) {
    const ultimaCuota = this.invDetail?.ultimaCuota ?? 0;

    const items: CronogramaItem[] = data.map(item => ({
      nroCuota: item.nroCuota,
      fechaCierre: item.fechaCierre,
      diasCuota: item.diasCuota,
      montoCuota: item.montoCuota,
      pagado: item.nroCuota <= ultimaCuota
    }));

    this.totalCuotas = items.length;
    this.totalMonto = items.reduce((acc, i) => acc + i.montoCuota, 0);

    const gruposMap = new Map<string, CronogramaItem[]>();
    for (const item of items) {
      const label = this.obtenerMesAnio(item.fechaCierre);
      if (!gruposMap.has(label)) gruposMap.set(label, []);
      gruposMap.get(label)!.push(item);
    }

    this.grupos = Array.from(gruposMap.entries()).map(([label, items]) => ({
      label,
      items,
      montoGrupo: items.reduce((acc, i) => acc + i.montoCuota, 0)
    }));
  }

  private obtenerMesAnio(fecha: string): string {
    const match = fecha.match(/de\s+([a-zA-Záéíóúñ]+)\.?\s+(\d{4})/i);
    if (!match) return fecha;
    const abrev = match[1].toLowerCase().substring(0, 3);
    const mes = MESES[abrev] ?? match[1];
    return `${mes} ${match[2]}`;
  }

  async descargarPDF() {
    this.isGeneratingPdf = true;
    try {
      const { generarPdfCronograma } = await import('./cronograma-pdf.util');
      await generarPdfCronograma({
        invDetail: this.invDetail,
        pathLogo: this.pathLogo,
        currency: this.currency,
        grupos: this.grupos,
        totalCuotas: this.totalCuotas,
        totalMonto: this.totalMonto,
        mostrarMontosAgregados: this.mostrarMontosAgregados
      });
    } finally {
      this.isGeneratingPdf = false;
    }
  }

}
