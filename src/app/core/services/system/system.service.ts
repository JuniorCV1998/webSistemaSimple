import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

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


}
