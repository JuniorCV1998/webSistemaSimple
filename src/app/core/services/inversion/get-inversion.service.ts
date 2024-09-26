import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class GetInversionService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMPONENTE;

  constructor() { }

  getAmount(){
    return this.http.get(this.baseUrl+this.baseComponent+'getAmount');
  }

  getInversionesLast(){
    return this.http.get(this.baseUrl+this.baseComponent+'getInversionesLast');
  }

  getInversionesList(){
    return this.http.get(this.baseUrl+this.baseComponent+'getInversionesList');
  }



}
