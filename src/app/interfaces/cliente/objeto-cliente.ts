export interface ClienteNatural {
    codTipoDoc?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
}

export interface ClienteJuridico {
    codTipoDoc?: string;
    razonSocial?: string;
}