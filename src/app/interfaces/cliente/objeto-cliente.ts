export interface ClienteNatural {
    codTipoDoc?: string;
    nroDocumento?: string;
    nombres?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
}

export interface ClienteJuridico {
    codTipoDoc?: string;
    nroDocumento?: string;
    razonSocial?: string;
}