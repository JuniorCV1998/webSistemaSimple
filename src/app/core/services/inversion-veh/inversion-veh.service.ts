import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class InversionVehService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_INVERSION_VEH;

  constructor() { }

  /* getInversionesVehList(){
    return this.http.get(this.baseUrl+this.baseComponent+'getInvVehStatus');
  } */

  getInversionesVehList(estadoDeuda: String){
      const params = new HttpParams()
        .set('estadoDeuda', String(estadoDeuda));
      return this.http.get(this.baseUrl+this.baseComponent+'getInvVehStatus', {params});
    }

  registerInversionVeh(obj: any){
      return this.http.post(this.baseUrl+this.baseComponent+'registerInversionVeh',obj);
    }
    
    getInversionVehRegistered(idInversionVeh: number){
      const params = new HttpParams()
        .set('idInversionVeh', Number(idInversionVeh));
      return this.http.get(this.baseUrl+this.baseComponent+'getInversionVehRegistered', {params});
    }

    getInversionVehDetail(idInversionVeh: number){
      const params = new HttpParams()
        .set('idInversionVeh', Number(idInversionVeh));
      return this.http.get(this.baseUrl+this.baseComponent+'getInversionVehDetail', {params});
    }

    closeInvVehicular(idInversionVeh: number){
      const params = new HttpParams()
        .set('idInversionVeh', Number(idInversionVeh));
      return this.http.patch(this.baseUrl+this.baseComponent+'closeInvVehicular',null, {params});
    }

    insertPayVehicular(idInversionVeh: number, fecha: string, montoCuota: number){
      const params = new HttpParams()
        .set('idInversionVeh', Number(idInversionVeh))
        .set('fecha', fecha.toString())
        .set('montoCuota', Number(montoCuota));
        return this.http.post(this.baseUrl+this.baseComponent+'insertPayVehicular',null, {params});
     }
    
}
