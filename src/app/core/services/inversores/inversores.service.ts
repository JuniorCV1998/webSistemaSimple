import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class InversoresService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_INVERSORES;

  constructor() { }

  /* Cliente */

  getMyClients() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getMyClients');
  }

  getClienteDetail(idUsuario: number) {
    const params = new HttpParams()
      .set('idUsuario', Number(idUsuario));
    return this.http.get(this.baseUrl + this.baseComponent + 'getClienteDetail', { params });
  }

  getInversionescliente(idUsuario: number) {
    const params = new HttpParams()
      .set('idUsuario', Number(idUsuario));
    return this.http.get(this.baseUrl + this.baseComponent + 'getInversionesCliente', { params });
  }

  /* Configuracion */
  getConfiguracionInv() {
    return this.http.get(this.baseUrl + this.baseComponent + 'configuration-inv');
  }

  updateConfiguracionInv(request: any) {
    return this.http.post(this.baseUrl + this.baseComponent + 'configuration-inv', request);
  }


}
