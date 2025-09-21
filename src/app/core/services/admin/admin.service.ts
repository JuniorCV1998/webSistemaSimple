import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_ADMIN;

  constructor() { }

  getInversoresList(){
    return this.http.get(this.baseUrl+this.baseComponent+'getInversoresList');
  }

  getInversionesList(idInversor: number){
    const params = new HttpParams()
        .set('idInversor', Number(idInversor));
    return this.http.get(this.baseUrl+this.baseComponent+'getInversionesList', {params});
  }

  deleteInversion(codOperacion: string){
    let data = codOperacion.replace("SS-","");
    return this.http.delete(this.baseUrl+this.baseComponent+'inversion/'+data);
  }

  

}
