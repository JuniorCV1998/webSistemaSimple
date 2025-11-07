import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../appsettings';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);
    private baseUrl: string = appsettings.API_SERVER;
    private baseComponent: string = appsettings.API_COMP_USER;

  constructor() { }

  getProfileData(){
    return this.http.get(this.baseUrl+this.baseComponent+'profile');
  }
}
