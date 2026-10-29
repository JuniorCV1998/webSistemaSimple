import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { finalize } from 'rxjs';
import { ListEmptyNoneComponent } from '../../../../components/resources/list-empty-none/list-empty-none.component';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
    selector: 'app-reporte-cobranza',
    standalone: true,
    imports: [SkeletonModule, CommonModule, TabMenuModule, RouterModule, FormatNumberPipe, FormsModule,
        TableModule, DialogModule, ButtonModule, ListEmptyNoneComponent
    ],
    templateUrl: './reporte-cobranza.component.html',
    styleUrl: './reporte-cobranza.component.scss'
})
export default class ReporteCobranzaComponent {
    forSkeleton: number = 10;
    skeletonShow: boolean = true;
    cobrosHistory: any[] = [];

    currency: string | null = null;

    // Dialog
    dialogVisible = false;
    cobranzaSeleccionada: any[] = [];
    diaSeleccionado: any = null;

    constructor(
        private tempDataService: TempDataService,
        private getInversionService: GetInversionService,
        private router: Router,
    ) {
        this.currency = this.tempDataService.getConstant('currency') || 'S/';
    }

    ngOnInit(): void {
        this.getListCobranza();
    }

    openDialog(cobrosDelDia: any) {
        this.diaSeleccionado = cobrosDelDia;
        this.cobranzaSeleccionada = cobrosDelDia.cobranza;
        this.dialogVisible = true;
    }

    /* Se cierra el modal y se navega cuando terminó su animación de salida,
       si no el modal (vive en <body>) queda encima de la pantalla siguiente. */
    abrirCartilla(idInversion: number) {
        this.dialogVisible = false;
        setTimeout(() => {
            this.router.navigate(['/inversion/cartilla'], { queryParams: { idInversion } });
        }, 200);
    }

    iniciales(nombre: string): string {
        const partes = (nombre || '').trim().split(/\s+/).filter(p => p);
        return ((partes[0]?.[0] || '') + (partes[1]?.[0] || '')).toUpperCase();
    }

    getListCobranza() {
        this.skeletonShow = true;
        this.getInversionService.getDataReportCobranza().pipe(
            finalize(() => this.skeletonShow = false)).
            subscribe((resp: any) => {
                this.cobrosHistory = resp;
            });
    }

}