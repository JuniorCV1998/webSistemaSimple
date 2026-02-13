import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class GetInversionService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_INVERSION;

  constructor() { }

  getAmount() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getAmount');
  }

  getInversionesLast() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getInversionesLast');
  }

  getInversionesList() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getInversionesList');
  }

  getInversionesDetail(idInversion: number) {
    const params = new HttpParams()
      .set('idInversion', Number(idInversion));
    return this.http.get(this.baseUrl + this.baseComponent + 'getInversionesDetail', { params });
  }

  pagarCuotsa(idInversion: number) {
    const params = new HttpParams()
      .set('idInversion', Number(idInversion));
    return this.http.get(this.baseUrl + this.baseComponent + 'pagarCuota', { params });
  }

  pagarCuota(idInversion: number, nroCuota: number, fecha: string) {
    const params = new HttpParams()
      .set('idInversion', Number(idInversion))
      .set('nroCuota', Number(nroCuota))
      .set('fecha', fecha.toString());
    return this.http.post(this.baseUrl + this.baseComponent + 'pagarCuota', null, { params });
  }

  getValidationValues() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getValidationValues');
  }

  sendSimulation(obj: any) {
    return this.http.post(this.baseUrl + this.baseComponent + 'sendSimulation', obj);
  }

  registerInversion(obj: any) {
    return this.http.post(this.baseUrl + this.baseComponent + 'registerInversion', obj);
  }

  getInversionRegistered(idInversion: number) {
    const params = new HttpParams()
      .set('idInversion', Number(idInversion));
    return this.http.get(this.baseUrl + this.baseComponent + 'getInversionRegistered', { params });
  }

  getInversionesClient() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getInversionesClient');
  }

  getReportCollection() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getReportCollection');
  }

  renewInversion(obj: any) {
    return this.http.post(this.baseUrl + this.baseComponent + 'renewInversion', obj);
  }

  getDataReportCobranza() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getDataReportCobranza');
  }

  getRentabilidadInversion(mes_inicio: string, mes_fin: string) {
    const params = new HttpParams()
      .set('mes_inicio', String(mes_inicio))
      .set('mes_fin', String(mes_fin));
    return this.http.get(this.baseUrl + this.baseComponent + 'getReporteRentabilidad', { params });
  }

}
