/* Tipos de documento y códigos de país para clientes/inversores (incluye extranjeros). */

export interface TipoDocumento {
  codigo: string;
  descripcionAbrev: string;
  descripcion: string;
}

export const TIPO_DOC = {
  DNI: '01',
  CARNE_EXT: '04',
  RUC: '06',
  PASAPORTE: '07'
} as const;

/** Respaldo si GET /webp/tipos-documento falla (mismo contenido que devuelve el backend). */
export const TIPOS_DOC_DEFECTO: TipoDocumento[] = [
  { codigo: '01', descripcionAbrev: 'DNI', descripcion: 'DOCUMENTO NACIONAL DE IDENTIDAD' },
  { codigo: '04', descripcionAbrev: 'CARNÉ EXT.', descripcion: 'CARNÉ DE EXTRANJERÍA' },
  { codigo: '06', descripcionAbrev: 'RUC', descripcion: 'REG. ÚNICO DE CONTRIBUYENTES' },
  { codigo: '07', descripcionAbrev: 'PASAPORTE', descripcion: 'PASAPORTE' }
];

interface ReglaDocumento {
  min: number;
  max: number;
  /** true: letras y números (carné de extranjería, pasaporte); false: solo dígitos. */
  alfanumerico: boolean;
  etiqueta: string;
}

const REGLAS: Record<string, ReglaDocumento> = {
  '01': { min: 8, max: 8, alfanumerico: false, etiqueta: 'DNI' },
  // C.E. y pasaporte: el backend solo exige máx. 15 caracteres; en front se pide un rango razonable.
  '04': { min: 6, max: 12, alfanumerico: true, etiqueta: 'C.E.' },
  '06': { min: 11, max: 11, alfanumerico: false, etiqueta: 'RUC' },
  '07': { min: 6, max: 12, alfanumerico: true, etiqueta: 'Pasaporte' }
};

export function reglaDocumento(codTipoDoc: string | null | undefined): ReglaDocumento | null {
  return codTipoDoc ? REGLAS[codTipoDoc] ?? null : null;
}

/** Etiqueta corta para mostrar junto al número ("DNI", "C.E.", "RUC", "Pasaporte"). */
export function etiquetaDocumento(codTipoDoc: string | null | undefined): string {
  return reglaDocumento(codTipoDoc)?.etiqueta ?? '-';
}

/** Persona natural: DNI, carné de extranjería y pasaporte (todo menos RUC). */
export function esPersonaNatural(codTipoDoc: string | null | undefined): boolean {
  return codTipoDoc !== TIPO_DOC.RUC;
}

/** Carné de extranjería y pasaporte: RENIEC/SUNAT no los cubren, el nombre se escribe a mano. */
export function sinAutocompletado(codTipoDoc: string | null | undefined): boolean {
  return codTipoDoc === TIPO_DOC.CARNE_EXT || codTipoDoc === TIPO_DOC.PASAPORTE;
}

/** Limpia lo que escribe el usuario según el tipo (mayúsculas sin espacios para alfanuméricos). */
export function limpiarNroDocumento(codTipoDoc: string | null | undefined, valor: string): string {
  const regla = reglaDocumento(codTipoDoc);
  const limpio = (valor || '').toUpperCase().replace(regla?.alfanumerico ? /[^A-Z0-9]/g : /\D/g, '');
  return regla ? limpio.slice(0, regla.max) : limpio;
}

/** Mensaje de ayuda cuando el número no cumple la longitud del tipo. */
export function mensajeNroDocumento(codTipoDoc: string | null | undefined): string {
  const regla = reglaDocumento(codTipoDoc);
  if (!regla) return '';
  return regla.min === regla.max
    ? `El ${regla.etiqueta} debe tener ${regla.min} dígitos.`
    : `El ${regla.etiqueta} debe tener entre ${regla.min} y ${regla.max} caracteres.`;
}

export function nroDocumentoValido(codTipoDoc: string | null | undefined, nro: string): boolean {
  const regla = reglaDocumento(codTipoDoc);
  if (!regla || !nro) return false;
  const patron = regla.alfanumerico ? /^[A-Z0-9]+$/i : /^\d+$/;
  return patron.test(nro) && nro.length >= regla.min && nro.length <= regla.max;
}

/* ===== Código de país del celular ===== */

export interface Pais {
  codPais: string;   // solo dígitos, sin "+"
  iso: string;
  nombre: string;
  bandera: string;
}

export const COD_PAIS_PERU = '51';

export const PAISES: Pais[] = [
  { codPais: '51', iso: 'PE', nombre: 'Perú', bandera: '🇵🇪' },
  { codPais: '58', iso: 'VE', nombre: 'Venezuela', bandera: '🇻🇪' },
  { codPais: '57', iso: 'CO', nombre: 'Colombia', bandera: '🇨🇴' },
  { codPais: '593', iso: 'EC', nombre: 'Ecuador', bandera: '🇪🇨' },
  { codPais: '591', iso: 'BO', nombre: 'Bolivia', bandera: '🇧🇴' },
  { codPais: '56', iso: 'CL', nombre: 'Chile', bandera: '🇨🇱' },
  { codPais: '54', iso: 'AR', nombre: 'Argentina', bandera: '🇦🇷' },
  { codPais: '55', iso: 'BR', nombre: 'Brasil', bandera: '🇧🇷' },
  { codPais: '595', iso: 'PY', nombre: 'Paraguay', bandera: '🇵🇾' },
  { codPais: '598', iso: 'UY', nombre: 'Uruguay', bandera: '🇺🇾' },
  { codPais: '52', iso: 'MX', nombre: 'México', bandera: '🇲🇽' },
  { codPais: '507', iso: 'PA', nombre: 'Panamá', bandera: '🇵🇦' },
  { codPais: '506', iso: 'CR', nombre: 'Costa Rica', bandera: '🇨🇷' },
  { codPais: '503', iso: 'SV', nombre: 'El Salvador', bandera: '🇸🇻' },
  { codPais: '502', iso: 'GT', nombre: 'Guatemala', bandera: '🇬🇹' },
  { codPais: '504', iso: 'HN', nombre: 'Honduras', bandera: '🇭🇳' },
  { codPais: '505', iso: 'NI', nombre: 'Nicaragua', bandera: '🇳🇮' },
  { codPais: '53', iso: 'CU', nombre: 'Cuba', bandera: '🇨🇺' },
  { codPais: '1', iso: 'US', nombre: 'Estados Unidos / Canadá', bandera: '🇺🇸' },
  { codPais: '34', iso: 'ES', nombre: 'España', bandera: '🇪🇸' },
  { codPais: '39', iso: 'IT', nombre: 'Italia', bandera: '🇮🇹' },
  { codPais: '33', iso: 'FR', nombre: 'Francia', bandera: '🇫🇷' },
  { codPais: '49', iso: 'DE', nombre: 'Alemania', bandera: '🇩🇪' },
  { codPais: '44', iso: 'GB', nombre: 'Reino Unido', bandera: '🇬🇧' },
  { codPais: '351', iso: 'PT', nombre: 'Portugal', bandera: '🇵🇹' },
  { codPais: '86', iso: 'CN', nombre: 'China', bandera: '🇨🇳' },
  { codPais: '81', iso: 'JP', nombre: 'Japón', bandera: '🇯🇵' },
  { codPais: '82', iso: 'KR', nombre: 'Corea del Sur', bandera: '🇰🇷' }
];

/** Solo los dígitos del celular. */
export function celularLimpio(celular: string | null | undefined): string {
  return (celular || '').replace(/\D/g, '');
}

/** Misma regla que el backend: Perú 9 dígitos empezando en 9; otros países 4-15 dígitos. */
export function celularValido(celular: string | null | undefined, codPais: string | null | undefined): boolean {
  const limpio = celularLimpio(celular);
  if ((codPais || COD_PAIS_PERU) === COD_PAIS_PERU) return /^9\d{8}$/.test(limpio);
  return /^\d{4,15}$/.test(limpio);
}

/** Celular para mostrar: "+51 987 654 321" (el prefijo solo si no es Perú, salvo que se pida). */
export function celularParaMostrar(celular: string | null | undefined, codPais: string | null | undefined, siemprePrefijo = false): string {
  const limpio = celularLimpio(celular);
  if (!limpio) return '';
  const cod = codPais || COD_PAIS_PERU;
  let agrupado: string;
  if (cod === COD_PAIS_PERU) {
    agrupado = limpio.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');        // 987 654 321
  } else if (limpio.length > 7) {
    // Otros países: bloques de 3 desde la izquierda y los últimos 4 juntos (300 123 4567)
    const inicio = limpio.slice(0, -4).replace(/(\d{3})(?=\d)/g, '$1 ');
    agrupado = `${inicio} ${limpio.slice(-4)}`;
  } else {
    agrupado = limpio;
  }
  return cod === COD_PAIS_PERU && !siemprePrefijo ? agrupado : `+${cod} ${agrupado}`;
}
