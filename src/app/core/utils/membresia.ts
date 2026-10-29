/**
 * Planes de membresía y datos de contacto configurables por el admin (Ajustes del sistema).
 * Mientras el backend no exponga los servicios, la app usa AJUSTES_ACTUALES: los mismos valores
 * que antes estaban en duro en cada pantalla.
 */

export interface PlanMembresia {
  idPlan?: number | null;
  meses: number;
  precio: number | null;
  activo: boolean;
  destacado: boolean;
  /** Beneficios propios del plan, además de lo que incluyen todos. */
  beneficios: string[];
}

export interface OfertaMembresia {
  activa: boolean;
  porcentaje: number | null;
  fechaFin: string; // yyyy-MM-dd
  texto: string;
}

export interface ContactoSistema {
  whatsappCodPais: string;
  whatsappNumero: string;
  correo: string;
  horario: string;
}

export interface AjustesSistema {
  contacto: ContactoSistema;
  enlaces: { urlPlayStore: string; urlAppStore: string };
  /** Lo que incluyen todos los planes. */
  incluye: string[];
  planes: PlanMembresia[];
  oferta: OfertaMembresia;
}

/** Lo que ve el inversor: solo planes activos, con el precio final ya calculado. */
export interface PlanPublico {
  meses: number;
  precio: number;
  precioFinal: number;
  destacado: boolean;
  beneficios: string[];
}

export interface AjustesPublicos {
  /** Meses gratis al crear la cuenta (MES_FREE, configurable en Configurar mi App). 0 = sin prueba. */
  mesesPrueba: number;
  contacto: ContactoSistema;
  enlaces: { urlPlayStore: string; urlAppStore: string };
  incluye: string[];
  planes: PlanPublico[];
  oferta: { porcentaje: number; fechaFin: string; texto: string } | null;
}

export const INCLUYE_DEFECTO: string[] = [
  'Registro de clientes y préstamos',
  'Cronograma y cartilla de pagos',
  'Recordatorios de cobro por WhatsApp',
  'Reportes de cobranza y rentabilidad',
  'App para que tus clientes vean sus cuotas',
  'Soporte por WhatsApp y actualizaciones',
];

export const AJUSTES_ACTUALES: AjustesSistema = {
  contacto: { whatsappCodPais: '51', whatsappNumero: '920605673', correo: 'generalservicesjyr@gmail.com', horario: '' },
  enlaces: { urlPlayStore: 'https://play.google.com/store/apps/details?id=com.ssimple.app', urlAppStore: '' },
  incluye: INCLUYE_DEFECTO,
  planes: [], // se completa abajo con PLANES_SUGERIDOS (precios vigentes)
  oferta: { activa: false, porcentaje: null, fechaFin: '', texto: '' },
};

/** Meses gratis por defecto al crear la cuenta, si el servicio no responde. */
export const MESES_PRUEBA_DEFECTO = 1;

/**
 * Precios vigentes (aprobados) frente a la competencia (S/ 65 al mes, S/ 170 trimestral, S/ 700 anual):
 * más bajos en todos los planes, con un ahorro que crece con la permanencia y beneficios extra
 * en los planes largos para empujar el pago adelantado. "Usar sugeridos" en el admin vuelve a ellos.
 */
export const PLANES_SUGERIDOS: Record<number, Omit<PlanMembresia, 'meses' | 'idPlan'>> = {
  1: { precio: 49, activo: true, destacado: false, beneficios: [] },
  2: { precio: 95, activo: false, destacado: false, beneficios: [] },
  3: { precio: 129, activo: true, destacado: false, beneficios: ['Prioridad en soporte'] },
  6: { precio: 239, activo: true, destacado: false, beneficios: ['Prioridad en soporte', 'Te ayudamos a registrar tu cartera'] },
  12: {
    precio: 429, activo: true, destacado: true,
    beneficios: ['Prioridad en soporte', 'Te ayudamos a registrar tu cartera', 'Capacitación 1 a 1', 'Precio congelado por 12 meses']
  },
};

AJUSTES_ACTUALES.planes = [1, 2, 3, 6, 12].map(meses => ({ meses, ...JSON.parse(JSON.stringify(PLANES_SUGERIDOS[meses])) }));

/** "Tu primer mes es gratis" / "Tus primeros 2 meses son gratis" ('' si no hay prueba). */
export const textoPrueba = (meses: number | null | undefined): string =>
  !meses ? '' : meses === 1 ? 'Tu primer mes es gratis' : `Tus primeros ${meses} meses son gratis`;

/* ===== Cálculos (los mismos en el admin y en lo que ve el inversor) ===== */

export const nombrePlan = (meses: number): string =>
  ({ 1: 'Mensual', 2: 'Bimestral', 3: 'Trimestral', 6: 'Semestral', 12: 'Anual' } as Record<number, string>)[meses]
  ?? `${meses} meses`;

export const duracionPlan = (meses: number): string => meses === 1 ? '1 mes' : `${meses} meses`;

export const soles = (monto: number | null | undefined): string => (Number(monto) || 0).toFixed(2);

/** Monto sin decimales cuando es entero (S/ 49 en vez de S/ 49.00). */
export const solesCorto = (monto: number | null | undefined): string => {
  const n = Number(monto) || 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

export const hoyLima = (): string => {
  // en-CA da yyyy-MM-dd
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
};

export const fechaCorta = (iso: string): string => {
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
  const [, m, d] = (iso || '').split('-').map(Number);
  return m && d ? `${d} ${meses[m - 1]}` : '';
};

export const ofertaVigente = (o: OfertaMembresia): boolean =>
  !!o.activa && (o.porcentaje ?? 0) > 0 && !!o.fechaFin && o.fechaFin >= hoyLima();

export const aplicarOferta = (precio: number, porcentaje: number | null | undefined): number =>
  porcentaje ? Math.round(precio * (1 - porcentaje / 100) * 100) / 100 : precio;

/** Lo que vería el inversor con estos ajustes (lo mismo que debe devolver ajustes-publicos). */
export const aPublicos = (a: AjustesSistema): AjustesPublicos => {
  const vigente = ofertaVigente(a.oferta);
  return {
    mesesPrueba: MESES_PRUEBA_DEFECTO,
    contacto: a.contacto,
    enlaces: a.enlaces,
    incluye: a.incluye.filter(Boolean),
    planes: a.planes
      .filter(p => p.activo && (p.precio ?? 0) > 0)
      .sort((x, y) => x.meses - y.meses)
      .map(p => ({
        meses: p.meses,
        precio: Number(p.precio),
        precioFinal: vigente ? aplicarOferta(Number(p.precio), a.oferta.porcentaje) : Number(p.precio),
        destacado: p.destacado,
        beneficios: (p.beneficios ?? []).filter(Boolean),
      })),
    oferta: vigente ? { porcentaje: Number(a.oferta.porcentaje), fechaFin: a.oferta.fechaFin, texto: a.oferta.texto } : null,
  };
};

/* ===== Plan contratado (getInversorDetail / getProfileData → membresia.planActual, enPrueba) ===== */

export interface PagoMembresia {
  meses: number;
  /** Plan del catálogo vigente al pagar (null si ya no existe). */
  idPlan?: number | null;
  /** Precio del plan (con oferta) al momento del pago, para comparar con lo cobrado. */
  precioLista?: number | null;
  montoPagado: number;
  fechaPago: string;
  usuarioAccion?: string;
}

/** "Prueba gratis", "Plan Anual"… o el nombre genérico de siempre si el backend no envía el plan. */
export const nombrePlanContratado = (m: { enPrueba?: boolean; planActual?: PagoMembresia | null; descTipoMembresia?: string } | null | undefined): string => {
  if (m?.enPrueba) return 'Prueba gratis';
  if (m?.planActual?.meses) return `Plan ${nombrePlan(m.planActual.meses)}`;
  return m?.descTipoMembresia || 'Plan';
};

/* ===== Documento del usuario (para identificarlo al pedir la renovación por WhatsApp) ===== */

const KEY_TIPO_DOC = 'renovacionCodTipoDoc';
const KEY_NRO_DOC = 'renovacionNroDocumento';

/**
 * Guarda el documento del usuario que acaba de iniciar sesión (o que fue bloqueado por membresía).
 * Sin documento se borra el anterior, para no enviar el de otra cuenta del mismo dispositivo.
 */
export const guardarDocumento = (persona: { codTipoDoc?: string; nroDocumento?: string } | null | undefined): void => {
  try {
    if (persona?.nroDocumento) {
      sessionStorage.setItem(KEY_TIPO_DOC, persona.codTipoDoc ?? '');
      sessionStorage.setItem(KEY_NRO_DOC, persona.nroDocumento);
    } else {
      sessionStorage.removeItem(KEY_TIPO_DOC);
      sessionStorage.removeItem(KEY_NRO_DOC);
    }
  } catch { /* sin almacenamiento: el mensaje sale sin documento */ }
};

export const documentoGuardado = (): { codTipoDoc: string; nroDocumento: string } | null => {
  try {
    const nroDocumento = sessionStorage.getItem(KEY_NRO_DOC);
    return nroDocumento ? { codTipoDoc: sessionStorage.getItem(KEY_TIPO_DOC) ?? '', nroDocumento } : null;
  } catch {
    return null;
  }
};

export const enlaceWhatsapp =(c: ContactoSistema, mensaje: string): string =>
  `https://wa.me/${c.whatsappCodPais}${c.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
