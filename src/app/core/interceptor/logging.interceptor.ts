import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  //console.log('Solicitud enviada:', JSON.stringify(req));

  return next(req).pipe(
    tap({
      next: (event) => {
        // Verifica si el evento es una respuesta
        if (event.type === 4) { // 4 indica que es una respuesta
          //console.log('Respuesta recibida:', JSON.stringify(event));
        }
      },
      error: (error) => {
        // Captura errores de la respuesta
        //console.error('Error en la respuesta:', JSON.stringify(error));
      }
    })
  );
};
