import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { EMPTY, filter, finalize, map, Observable, of, switchMap, tap } from 'rxjs';
import { appsettings } from '../../../appsettings';
import { jwtDecode } from "jwt-decode";
import { inject, Injectable } from '@angular/core';
import { SystemService } from '../../system/system.service';
import { Router } from '@angular/router';
import { Constantes } from '../../../constant/Constantes';
import { App } from '@capacitor/app';
import { DialogService } from 'primeng/dynamicdialog';
import { UpdateAppComponent } from '../../../../pages/system/informativo/update-app/update-app.component';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.API_SERVER;

  user = {};

  appVersion = '';

  constructor(
    private systemService: SystemService,
    private router: Router,
    private dialogService: DialogService
  ) {
    App.getInfo().then(info => {
      this.appVersion = info.version;
    });
  }

  ngOnInit(): void {

  }

  iniciarSesion(credenciales: any): Observable<any> {

    return this.versionApp().pipe(
      switchMap(respVersion => {

        if (!respVersion.actualizado) {
          return this.dialogService.open(UpdateAppComponent, {
            //header: "Actualización requerida",
            showHeader: false,  // Oculta la barra superior
            width: '90vw',
            closable: false,
            modal: true,
            closeOnEscape: false,
            data: { respVersion },

          }).onClose;
        }

        return of(true);
      }),

      switchMap((respuesta: boolean) => {
        if (!respuesta) return EMPTY;

        return this.http.post<any>(`${this.baseUrl}login`, credenciales, {
          observe: 'response'
        });
      }),

      tap(response => {
        const cookie = response.headers.get('Authorization');
        if (cookie) {
          const token = cookie.replace("Bearer ", "");
          sessionStorage.setItem('token', token);
          if (response.body.data.codPerfil !== Constantes.PERFIL_ADM) this.consultarMantenimiento();
        }
      }),

      map(response => response.body)
    );
  }


  versionApp(): Observable<any> { //'3.0.0'
    return this.systemService.versionAnd(this.appVersion);
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
