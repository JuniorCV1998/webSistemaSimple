import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { LoginService } from '../services/auth/login/login.service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagePopUpComponent } from '../../pages/modal/message-pop-up/message-pop-up.component';
import { Constantes } from '../constant/Constantes';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Excluye la ruta de login del interceptor
  if (req.url.includes('/login')) {
    // Si la URL es de login, pasa la solicitud sin modificarla
    return next(req);
  }

  const router = inject(Router);
  const messageService = inject(MessageService);
  const dialogService = inject(DialogService);

  const token = sessionStorage.getItem('token');
  
  // Agrega el token a las solicitudes, excepto para el login
  const clonedReq = token && !req.url.includes('/login') 
    ? req.clone({ headers: req.headers
      .set('Authorization', `Bearer ${token}`)
      .set('ngrok-skip-browser-warning', '69420')
    }) 
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const ref = dialogService.open(MessagePopUpComponent, {
          data: {
            message: error.error.descripcion
          },
          header: Constantes.MSG_EXPIRED_SESSION,
          closable: false,
          modal: true,         
          width: '90%'
        });
        // Eliminar token y redirigir al login
        sessionStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
