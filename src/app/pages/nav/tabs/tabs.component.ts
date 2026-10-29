import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  carOutline, ellipsisHorizontal, home, homeOutline, logoWhatsapp, logOutOutline,
  people, peopleOutline, person, personOutline, settings, settingsOutline, trendingUpOutline, wallet, walletOutline
} from 'ionicons/icons';
import { Constantes } from '../../../core/constant/Constantes';
import { hapticSeleccion } from '../../../core/ionic/native';
import { transicionFade } from '../../../core/ionic/transiciones';
import { LoginService } from '../../../core/services/auth/login/login.service';

interface TabDef {
  /** Primer segmento de la URL: es el id de la pila de Ionic y lo que marca la pestaña activa. */
  tab: string;
  /** URL raíz de la pestaña. */
  url: string;
  label: string;
  icon: string;
  iconActivo: string;
}

const TAB_MAS = 'mas';

/**
 * Barra de pestañas inferior (ion-tabs). Las pestañas dependen del perfil:
 *   INV: Inicio · Clientes · Cobranza · WhatsApp · Más
 *   CLI: Inicio · Perfil · Más
 *   ADM: Inicio · Configuración · Más
 * "Más" no es una ruta: abre una hoja de acciones con el resto del menú y Cerrar sesión.
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export default class TabsComponent {

  @ViewChild(IonTabs, { static: true }) ionTabs!: IonTabs;
  @ViewChild(IonTabBar, { static: true, read: ElementRef }) tabBarEl!: ElementRef<HTMLElement & { selectedTab?: string }>;

  readonly tabMas = TAB_MAS;
  tabs: TabDef[] = [];
  codPerfil: string | null = null;
  permisoVehicular = false;

  constructor(
    private loginService: LoginService,
    private navCtrl: NavController,
    private router: Router,
    private actionSheetCtrl: ActionSheetController
  ) {
    addIcons({ carOutline, logOutOutline, personOutline, settingsOutline, trendingUpOutline });

    const token = this.loginService.getDecodedToken();
    this.codPerfil = token?.codPerfil ?? null;
    this.permisoVehicular = (token?.permisos ?? []).some((p: any) => p.codigo === Constantes.INV_VEHICULAR);
    this.tabs = this.tabsPorPerfil(this.codPerfil);
  }

  private tabsPorPerfil(perfil: string | null): TabDef[] {
    const inicio: TabDef = { tab: 'inicio', url: '/inicio', label: 'Inicio', icon: homeOutline, iconActivo: home };
    if (perfil === Constantes.PERFIL_INV) {
      return [
        inicio,
        { tab: 'clientes', url: '/clientes', label: 'Clientes', icon: peopleOutline, iconActivo: people },
        { tab: 'reporte', url: '/reporte/pagos-pendientes', label: 'Cobranza', icon: walletOutline, iconActivo: wallet },
        { tab: 'whatsapp', url: '/whatsapp', label: 'WhatsApp', icon: logoWhatsapp, iconActivo: logoWhatsapp },
      ];
    }
    if (perfil === Constantes.PERFIL_CLI) {
      return [inicio, { tab: 'perfil', url: '/perfil', label: 'Perfil', icon: personOutline, iconActivo: person }];
    }
    if (perfil === Constantes.PERFIL_ADM) {
      return [inicio, { tab: 'adm', url: '/adm/configuracion', label: 'Configuración', icon: settingsOutline, iconActivo: settings }];
    }
    return [inicio];
  }

  readonly iconMas = ellipsisHorizontal;

  /** Pestaña que la barra marca como activa (las pantallas del menú "Más" marcan "Más"). */
  seleccionada = 'inicio';

  /**
   * IonTabs arma la URL de cada pestaña como `${prefijo}/${tab}`, y con las pestañas en la raíz
   * el prefijo es "/" (quedaría "//inicio"). Por eso el clic se maneja aquí, replicando su lógica:
   * - pestaña ya activa -> vuelve a la raíz de esa pestaña;
   * - otra pestaña     -> vuelve a la última pantalla que se vio en ella (o a su raíz).
   */
  onTabClick(ev: CustomEvent<{ tab: string }>): void {
    ev.stopPropagation(); // que IonTabs no procese el clic por su cuenta
    const tab = ev.detail.tab;
    hapticSeleccion();

    if (tab === TAB_MAS) {
      this.abrirMas();
      return;
    }

    const def = this.tabs.find(t => t.tab === tab);
    if (!def) return;
    const outlet: IonRouterOutlet = this.ionTabs.outlet;

    if (outlet.getActiveStackId() === tab) {
      if (outlet.getLastRouteView(tab)?.url !== def.url) {
        this.navCtrl.navigateRoot(def.url, { animated: true, animation: transicionFade });
      }
      return;
    }
    const ultima = outlet.getLastRouteView(tab);
    this.navCtrl.navigateRoot(ultima?.url || def.url, { ...(ultima?.savedExtras ?? {}), animated: true, animation: transicionFade });
  }

  /** IonTabs marca como activa la pestaña según el primer segmento de la URL; si no es una
   *  pestaña visible (ej. /perfil para INV), se marca "Más". */
  onTabsDidChange(ev: { tab: string }): void {
    const visible = this.tabs.some(t => t.tab === ev.tab);
    this.seleccionada = visible ? ev.tab : TAB_MAS;
    this.tabBarEl.nativeElement.selectedTab = this.seleccionada;
  }

  async abrirMas(): Promise<void> {
    const ir = (url: string) => () => { this.router.navigateByUrl(url); };
    const buttons: any[] = [];

    if (this.codPerfil === Constantes.PERFIL_INV) {
      buttons.push({ text: 'Mi perfil', icon: 'person-outline', handler: ir('/perfil') });
      buttons.push({ text: 'Reporte de rentabilidad', icon: 'trending-up-outline', handler: ir('/rentabilidad') });
      if (this.permisoVehicular) buttons.push({ text: 'Crédito vehicular', icon: 'car-outline', handler: ir('/vehicular/inicio') });
      buttons.push({ text: 'Configuración', icon: 'settings-outline', handler: ir('/inv/configuracion') });
    } else if (this.codPerfil === Constantes.PERFIL_CLI) {
      buttons.push({ text: 'Configuración', icon: 'settings-outline', handler: ir('/configuracion-cliente') });
    }

    buttons.push({ text: 'Cerrar sesión', icon: 'log-out-outline', role: 'destructive', handler: () => this.cerrarSesion() });
    buttons.push({ text: 'Cancelar', role: 'cancel' });

    const sheet = await this.actionSheetCtrl.create({ header: 'Más opciones', buttons, cssClass: 'mas-sheet' });
    await sheet.present();
  }

  cerrarSesion(): void {
    sessionStorage.clear();
    // Root: limpia la pila para que "atrás" no regrese a pantallas con sesión.
    this.navCtrl.navigateRoot('/login-user', { animation: transicionFade });
  }
}
