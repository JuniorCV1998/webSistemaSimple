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

  /** Actualiza celular, dirección y/o contraseña del usuario logueado. Enviar solo los campos que cambiaron. */
  updateProfile(body: { celular?: string; direccion?: string; contrasena?: string }) {
    return this.http.post(this.baseUrl + this.baseComponent + 'updateProfile', body);
  }
}
