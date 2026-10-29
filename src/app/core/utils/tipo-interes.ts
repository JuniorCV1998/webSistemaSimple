/** Tipo de interés del préstamo: "S" simple (sobre el capital) / "C" progresivo (se acumula por cuota, sin capitalizar). */
export const TIPO_INTERES = {
  SIMPLE: 'S',
  PROGRESIVO: 'C'
} as const;

export type TipoInteres = typeof TIPO_INTERES[keyof typeof TIPO_INTERES];

/** El backend solo permite interés progresivo con 1, 4 u 8 cuotas. */
export const CUOTAS_PROGRESIVO = [1, 4, 8];

export function permiteProgresivo(nroCuotas: number | null | undefined): boolean {
  return !!nroCuotas && CUOTAS_PROGRESIVO.includes(nroCuotas);
}
