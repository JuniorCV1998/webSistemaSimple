import { Animation, AnimationBuilder, createAnimation } from '@ionic/angular';

/**
 * Transiciones entre vistas (fintech mobile light), iguales en Android, iOS y web.
 *  - transicionPagina: avanzar/volver dentro de una pila. La vista nueva entra desde la derecha y
 *    la anterior se corre un poco a la izquierda y se atenúa (al volver, lo mismo al revés).
 *  - transicionFade: cambio de pestaña o de raíz (ej. cerrar sesión). Fundido corto con un leve
 *    desplazamiento hacia arriba, sin sensación de "ir hacia adelante/atrás".
 * Ionic quita `ion-page-invisible` de la vista que entra: hay que hacerlo también aquí.
 */

const CURVA = 'cubic-bezier(0.32, 0.72, 0, 1)';
const DESPLAZAMIENTO_FONDO = '-28%';

const reducirMovimiento = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Al terminar, Ionic limpia el transform/opacity de la animación, pero la vista que sale sigue en el
 * DOM un cuadro más antes de destruirse: sin esto reaparece en su sitio (encima de la que entra) y
 * se ve un pestañeo de la pantalla anterior. Se oculta en el mismo instante en que termina.
 * En el gesto de deslizar para volver no se aplica: si el gesto se cancela, esa vista se queda.
 */
const ocultarAlTerminar = (anim: Animation, opts: any): void => {
  if (!opts?.progressAnimation) anim.afterAddClass('ion-page-hidden');
};

export const transicionPagina: AnimationBuilder = (_baseEl: any, opts: any): Animation => {
  const atras = opts?.direction === 'back';
  const duracion = reducirMovimiento() ? 0 : 340;

  const raiz = createAnimation().duration(duracion).easing(CURVA);

  const entrando = createAnimation()
    .addElement(opts.enteringEl)
    .beforeRemoveClass('ion-page-invisible');

  if (atras) {
    // La vista de fondo vuelve a su sitio. Ionic la deja sin toques (pointer-events: none) hasta
    // que termina la transición; al volver se habilitan desde el inicio para que sus botones
    // respondan de inmediato (la que sale queda encima pero sigue sin recibir toques).
    entrando
      .beforeStyles({ 'pointer-events': 'auto' })
      .fromTo('transform', `translateX(${DESPLAZAMIENTO_FONDO})`, 'translateX(0)')
      .fromTo('opacity', '0.6', '1');
  } else {
    // La vista nueva entra desde la derecha, por encima (con sombra en el borde mientras se mueve)
    entrando
      .beforeStyles({ 'box-shadow': '-14px 0 28px -16px rgba(15, 23, 42, .28)' })
      .afterClearStyles(['box-shadow'])
      .fromTo('transform', 'translateX(100%)', 'translateX(0)')
      .fromTo('opacity', '1', '1');
  }
  raiz.addAnimation(entrando);

  if (opts.leavingEl) {
    const saliendo = createAnimation().addElement(opts.leavingEl);
    if (atras) {
      saliendo.fromTo('transform', 'translateX(0)', 'translateX(100%)');
      ocultarAlTerminar(saliendo, opts);
    } else {
      saliendo
        .fromTo('transform', 'translateX(0)', `translateX(${DESPLAZAMIENTO_FONDO})`)
        .fromTo('opacity', '1', '0.6');
    }
    raiz.addAnimation(saliendo);
  }

  return raiz;
};

export const transicionFade: AnimationBuilder = (_baseEl: any, opts: any): Animation => {
  const duracion = reducirMovimiento() ? 0 : 240;

  const raiz = createAnimation().duration(duracion).easing('cubic-bezier(0.2, 0, 0, 1)');

  raiz.addAnimation(
    createAnimation()
      .addElement(opts.enteringEl)
      .beforeRemoveClass('ion-page-invisible')
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(10px)', 'translateY(0)')
  );

  if (opts.leavingEl) {
    const saliendo = createAnimation()
      .addElement(opts.leavingEl)
      .duration(duracion * 0.6)
      .fromTo('opacity', '1', '0');
    ocultarAlTerminar(saliendo, opts);
    raiz.addAnimation(saliendo);
  }

  return raiz;
};
