import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

/*
 * Funciones nativas (Capacitor) usadas por la app. Todas son no-op en la web y nunca lanzan:
 * antes StatusBar/Keyboard se llamaban también en el navegador y rechazaban con "not implemented".
 */

const esNativo = () => Capacitor.isNativePlatform();
const plataforma = () => Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

/** Barra de estado y barras del sistema (mismo comportamiento que antes en Android). */
export async function initBarrasSistema(): Promise<void> {
  if (!esNativo()) return;
  try {
    // Texto oscuro sobre fondo claro (la app es de fondo blanco).
    await StatusBar.setStyle({ style: Style.Light });
    if (plataforma() === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await EdgeToEdge.enable();
    }
    // En iOS la barra de estado siempre va sobre el WebView: el espacio lo da --ion-safe-area-top.
  } catch { /* plugin no disponible */ }
}

/** Teclado: mantiene el scroll automático al enfocar inputs (solo existe en iOS). */
export async function initTeclado(): Promise<void> {
  if (plataforma() !== 'ios') return;
  try { await Keyboard.setScroll({ isDisabled: false }); } catch { /* sin soporte */ }
}

/** Oculta el splash nativo cuando la primera pantalla ya está pintada. */
export async function ocultarSplash(): Promise<void> {
  if (!esNativo()) return;
  try { await SplashScreen.hide({ fadeOutDuration: 250 }); } catch { /* sin soporte */ }
}

/** Vibración corta al tocar una pestaña u opción. */
export function hapticSeleccion(): void {
  if (!esNativo()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => { /* sin motor háptico */ });
}
