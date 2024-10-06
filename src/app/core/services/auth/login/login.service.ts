import { HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';
import { appsettings } from '../../../appsettings';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private baseUrl:string = appsettings.API_SERVER;

 user = {};

  constructor(
    
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
              const token = cookie.replace("Bearer ","");
              sessionStorage.setItem('token',token);
            }
          }),
          map(response => response.body)
        );
    }

   getToken(){
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
