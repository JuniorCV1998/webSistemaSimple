import { HttpClient} from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { appsettings } from '../../../appsettings';

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

   iniciarSesion(credenciales: any):Observable<any> {
    return this.http.post<any>(`${this.baseUrl}login`,credenciales);
  }

/*    getToken(){
    return localStorage.getItem('token');
   } */

}
