import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class CodigoUnicoService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_PUBLIC;

  constructor() { }

  /* getAmount(){
    return this.http.get(this.baseUrl+this.baseComponent+'buscar-cliente');
  } */

  buscarCliente(tipoDocumento: string, nroDocumento: string) {
    const params = new HttpParams()
      .set('tipoDocumento', tipoDocumento).set('nroDocumento', nroDocumento);
    return this.http.get(this.baseUrl + this.baseComponent + 'buscar-cliente', { params });
  }

  correoExistente(correo: string) {
    const params = new HttpParams()
      .set('correo', correo);
    return this.http.get(this.baseUrl + this.baseComponent + 'consultar-correo', { params });
  }

  crearCodigoUnico(obj: any) {
    return this.http.post(this.baseUrl + this.baseComponent + 'crear-codigo-unico', obj);
  }
}
