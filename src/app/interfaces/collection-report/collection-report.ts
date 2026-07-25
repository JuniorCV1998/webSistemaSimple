/* HIJOS */
export interface ObjReporteDiario {
    idInversion: number;
    fullName: string;
    nroInversion: number;
    valorCuota: number;
    ctasPagadas: number;
    nroCuotas: number;
    actualizado: number;
    ctasAtrasadas: number;
    recordatorioActivo?: boolean;
}

export interface ObjReporteSemanal {
    idInversion: number;
    fullName: string;
    nroInversion: number;
    valorCuota: number;
    fechaInicio?: string;
    fechaFin?: string;
    proximaFecha?: string;
    cuotasPendientes?: number;
    ctasAtrasadas: number;
    ctasPagadas: number;
    recordatorioActivo?: boolean;
}

export interface ReportDiario {
    lista: ObjReporteDiario[];
    totalCuotas: number;
}

/* PADRE */
export interface CollectionReport {
    reportDiario: ReportDiario;
    reportSemanal: ObjReporteSemanal[];
    amountCharged: number;
}
