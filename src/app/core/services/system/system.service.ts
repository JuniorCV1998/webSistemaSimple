import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { TIPOS_DOC_DEFECTO, TipoDocumento } from '../../utils/documento-pais';
import { AJUSTES_ACTUALES, AjustesPublicos, aPublicos } from '../../utils/membresia';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_PUBLIC;

  constructor() { }

  estadoCrearCu() {
    return this.http.get(this.baseUrl + this.baseComponent + 'estado-crear-cu');
  }

  mantenimiento() {
    return this.http.get(this.baseUrl + this.baseComponent + 'mantenimiento');
  }

  versionAnd(versionActual: String) {
    const params = new HttpParams()
			.set('versionActual', String(versionActual));
      return this.http.get(this.baseUrl+this.baseComponent+'version', {params});
  }

  urlStore() {
    return this.http.get(this.baseUrl + this.baseComponent + 'url-store');
  }

  private tiposDocumento$?: Observable<TipoDocumento[]>;

  /** Tipos de documento activos (DNI, C.E., RUC, Pasaporte). Se cachea; si falla usa la lista local. */
  tiposDocumento(): Observable<TipoDocumento[]> {
    if (!this.tiposDocumento$) {
      this.tiposDocumento$ = this.http.get<TipoDocumento[]>(this.baseUrl + this.baseComponent + 'tipos-documento').pipe(
        map(lista => Array.isArray(lista) && lista.length ? lista : TIPOS_DOC_DEFECTO),
        catchError(() => {
          this.tiposDocumento$ = undefined; // reintenta en la próxima pantalla
          return of(TIPOS_DOC_DEFECTO);
        }),
        shareReplay(1)
      );
    }
    return this.tiposDocumento$;
  }

  private ajustesPublicos$?: Observable<AjustesPublicos>;

  /**
   * Contacto, enlaces, planes activos y oferta vigente (Ajustes del sistema del admin).
   * Se cachea; si el servicio falla usa los valores que antes estaban en duro en la app.
   */
  ajustesPublicos(): Observable<AjustesPublicos> {
    if (!this.ajustesPublicos$) {
      const actuales = aPublicos(AJUSTES_ACTUALES);
      this.ajustesPublicos$ = this.http.get<AjustesPublicos>(this.baseUrl + this.baseComponent + 'ajustes-publicos').pipe(
        map(resp => ({
          mesesPrueba: resp?.mesesPrueba != null ? Number(resp.mesesPrueba) : actuales.mesesPrueba,
          contacto: { ...actuales.contacto, ...resp?.contacto },
          enlaces: { ...actuales.enlaces, ...resp?.enlaces },
          incluye: resp?.incluye?.length ? resp.incluye : actuales.incluye,
          planes: resp?.planes?.length
            ? resp.planes.map(p => ({ ...p, precio: Number(p.precio), precioFinal: Number(p.precioFinal ?? p.precio), beneficios: p.beneficios ?? [] }))
            : actuales.planes,
          oferta: resp?.oferta ?? null,
        })),
        catchError(() => {
          this.ajustesPublicos$ = undefined; // reintenta la próxima vez
          return of(actuales);
        }),
        shareReplay(1)
      );
    }
    return this.ajustesPublicos$;
  }

  /** Descarta la caché: el admin acaba de cambiar ajustes y el login debe ver los valores nuevos. */
  refrescarAjustesPublicos(): void {
    this.ajustesPublicos$ = undefined;
  }


}
