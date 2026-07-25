export type TipoCobro = 'DIARIO' | 'SEMANAL';

export interface RecordatorioWhatsappItem {
    idInversion: number;
    fullName: string;
    nroInversion: number;
    celular: string | null;
    tipoCobro: TipoCobro;
    recordatorioActivo: boolean;
}

export interface EstadoWhatsapp {
    vinculado: boolean;
    qrCode: string | null;
    /** Código de 8 caracteres para vincular ingresándolo directamente en WhatsApp (sin escanear QR). */
    pairingCode: string | null;
    /** Número vinculado a la instancia (sin "+", sin "@s.whatsapp.net"). Solo viene con valor si vinculado=true. */
    numeroVinculado: string | null;
}
