/**
 * Con Ionic, cada pantalla es una .ion-page que hace su propio scroll (la ventana ya no scrollea:
 * body es position:fixed). Estas funciones reemplazan a window.scrollY / window.scrollTo.
 */

/** Contenedor que scrollea a la pantalla que contiene `el`. */
export function contenedorScroll(el: Element | null | undefined): HTMLElement | null {
  return (el?.closest('.ion-page') as HTMLElement | null) ?? null;
}

export function scrollAlFinal(el: Element | null | undefined, behavior: ScrollBehavior = 'auto'): void {
  const cont = contenedorScroll(el);
  if (cont) cont.scrollTo({ top: cont.scrollHeight, behavior });
}

export function scrollArriba(el: Element | null | undefined, behavior: ScrollBehavior = 'smooth'): void {
  const cont = contenedorScroll(el);
  if (cont) cont.scrollTo({ top: 0, behavior });
}
