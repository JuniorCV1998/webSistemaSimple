import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;
  private baseComponent: string = appsettings.API_COMP_REGISTER;
  
  constructor() { }

  validateRegister(obj: any){
    return this.http.post(this.baseUrl+this.baseComponent+'validate',obj);
  }
}
