import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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

    constructor(
        private tempDataService: TempDataService,
        private getInversionService: GetInversionService,
    ) {
        this.currency = this.tempDataService.getConstant('currency') || 'S/';
    }

    ngOnInit(): void {
        this.getListCobranza();
    }

    openDialog(cobrosDelDia: any) {
        this.cobranzaSeleccionada = cobrosDelDia.cobranza;
        this.dialogVisible = true;
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