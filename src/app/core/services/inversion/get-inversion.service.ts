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

  /* Recordatorios automáticos de pago por WhatsApp */

  getRecordatoriosWhatsapp() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getRecordatoriosWhatsapp');
  }

  actualizarRecordatorioWhatsapp(idInversion: number, activar: boolean) {
    const params = new HttpParams()
      .set('idInversion', Number(idInversion))
      .set('activar', activar);
    return this.http.post(this.baseUrl + this.baseComponent + 'actualizarRecordatorioWhatsapp', null, { params });
  }

  /** Consulta si el inversor ya vinculó su WhatsApp. No genera QR: para usar en polling. */
  getEstadoWhatsapp() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getEstadoWhatsapp');
  }

  /**
   * Inicia/retoma la vinculación. Devuelve un QR si aún no está conectado.
   * "numero" es opcional: solo tiene efecto la primera vez que el inversor vincula
   * (cuando aún no existe ninguna instancia); en ese caso también devuelve un pairingCode.
   */
  vincularWhatsapp(numero?: string) {
    let params = new HttpParams();
    if (numero) params = params.set('numero', numero);
    return this.http.post(this.baseUrl + this.baseComponent + 'vincularWhatsapp', null, { params });
  }

  /** Cierra la sesión de WhatsApp vinculada (elimina la instancia en Evolution API y marca whatsappEstado='N'). */
  desvincularWhatsapp() {
    return this.http.post(this.baseUrl + this.baseComponent + 'desvincularWhatsapp', null);
  }

  getConfiguracionWhatsapp() {
    return this.http.get(this.baseUrl + this.baseComponent + 'getConfiguracionWhatsapp');
  }

  actualizarHoraEnvioWhatsapp(hora: string) {
    const params = new HttpParams()
      .set('hora', hora);
    return this.http.post(this.baseUrl + this.baseComponent + 'actualizarHoraEnvioWhatsapp', null, { params });
  }

  /** Guarda el mensaje personalizado del recordatorio. Puede incluir "{nombre}", que el backend
   *  reemplaza por el nombre del cliente al momento de enviar. Máximo 500 caracteres. */
  actualizarMensajeWhatsapp(mensaje: string) {
    const params = new HttpParams()
      .set('mensaje', mensaje);
    return this.http.post(this.baseUrl + this.baseComponent + 'actualizarMensajeWhatsapp', null, { params });
  }

}
