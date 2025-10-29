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
