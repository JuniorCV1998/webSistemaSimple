import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { finalize, map, Observable, tap } from 'rxjs';
import { appsettings } from '../../../appsettings';
import { jwtDecode } from "jwt-decode";
import { inject, Injectable } from '@angular/core';
import { SystemService } from '../../system/system.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;

  user = {};

  constructor(
    private systemService: SystemService,
    private router: Router
  ) {
  }

  /*  iniciarSesion(credenciales: any):Observable<any> {
    return this.http.post<any>(`${this.baseUrl}login`,credenciales);
  } */

  iniciarSesion(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}login`, credenciales, { observe: 'response' })
      .pipe(
        tap(response => {
          // Recupera la cookie del encabezado de la respuesta
          const cookie = response.headers.get('Authorization')!;
          if (cookie) {
            // Guarda la cookie en sesión
            //sessionStorage.setItem('miCookie', cookie);
            const token = cookie.replace("Bearer ", "");
            sessionStorage.setItem('token', token);

            this.consultarMantenimiento();
          }
        }),
        map(response => response.body)
      );
  }

  consultarMantenimiento() {
    this.systemService.mantenimiento().subscribe({
      next: (response: any) => {
        if (response[0].value == 1) {
          this.router.navigate(['/mantenimiento']);
        }
      },
      error: err => {
        console.error('Error al verificar mantenimiento', err);
      }
    });

  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    return decoded.exp > currentTime; // Verifica si el token aún es válido
  }

  getDecodedToken() {
    const token = this.getToken();
    if (token) {
      const decoded: any = jwtDecode(token); // Decodifica el token
      return decoded; // Devuelve el objeto decodificado
    }
    return null;
  }

}
