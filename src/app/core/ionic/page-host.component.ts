import { Component, ComponentRef, OnDestroy, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

/** Carga perezosa de la pantalla real: `() => import('...')` o `() => Promise.resolve(Componente)`. */
export type PageLoader = () => Promise<any>;

/**
 * Reemplazo de `router.getCurrentNavigation()` para leer el `state` enviado al navegar.
 * Las pantallas se crean dentro de PageHostComponent después de un import() asíncrono, cuando la
 * navegación ya terminó y getCurrentNavigation() devuelve null; el router guarda ese mismo state en
 * history.state, así que se toma de ahí.
 */
export function navegacionActual(router: Router): { extras?: { state?: any } } | null {
  return router.getCurrentNavigation() ?? { extras: { state: typeof history !== 'undefined' ? history.state : undefined } };
}

/**
 * Contenedor de cada pantalla dentro de <ion-router-outlet>.
 *
 * Ionic deja en caché las páginas de su pila (no vuelve a ejecutar ngOnInit al regresar), pero
 * las pantallas de la app asumen el comportamiento del <router-outlet> de Angular: se crean de
 * nuevo cada vez que se entra (Inicio limpia sessionStorage, los listados recargan datos, etc.).
 * Este host es lo que Ionic anima y guarda en su pila; la pantalla real vive adentro y se vuelve
 * a crear cada vez que la URL entra a esta ruta desde otra. Así se ganan las transiciones nativas
 * sin cambiar el ciclo de vida de ninguna pantalla existente.
 *
 * Uso en las rutas: `{ path: 'x', component: PageHostComponent, data: { page: () => import('...') } }`
 */
@Component({
  selector: 'app-page-host',
  standalone: true,
  template: '<ng-container #host></ng-container>',
})
export class PageHostComponent implements OnInit, OnDestroy {

  @ViewChild('host', { read: ViewContainerRef, static: true }) host!: ViewContainerRef;

  private page?: Type<any>;
  private pageRef?: ComponentRef<any>;
  private miUrl = '';
  private ultimaUrl = '';
  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) { }

  async ngOnInit(): Promise<void> {
    this.miUrl = this.router.serializeUrl(this.router.createUrlTree(['.'], { relativeTo: this.route }));
    // Se crea para esta URL: la navegación que la activó no debe provocar un segundo render.
    this.ultimaUrl = this.miUrl;

    this.sub = this.router.events.pipe(
      filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd)
    ).subscribe(ev => {
      const actual = ev.urlAfterRedirects.split(/[?#]/)[0];
      if (actual === this.miUrl && this.ultimaUrl !== this.miUrl) this.render();
      this.ultimaUrl = actual;
    });

    const loader: PageLoader | undefined = this.route.snapshot.data['page'];
    if (!loader) return;
    const mod = await loader();
    this.page = mod?.default ?? mod;
    this.render();
  }

  /**
   * BlockBackGuard lee esta propiedad del componente de la ruta, que ahora es el host:
   * se reenvía la de la pantalla real (ej. Mantenimiento).
   */
  get blockBackNavigation(): boolean {
    return !!this.pageRef?.instance?.blockBackNavigation;
  }

  private render(): void {
    if (!this.page) return;
    this.host.clear();
    this.pageRef = this.host.createComponent(this.page);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
