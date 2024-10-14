import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/auth/login/login.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const loginService = inject(LoginService);
  const token = loginService.getToken();
  const decodedToken = loginService.getDecodedToken();
  const tokenIsValid = loginService.isTokenValid();
  const router = inject(Router); // Inyecta el Router

  if (token) {
     // Permite el acceso si hay un token
    if(!tokenIsValid){
      sessionStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    } //else return true;

        // Decodifica el token
        const userProfiles = decodedToken.codPerfil;
        // Verifica si el usuario tiene el perfil requerido para acceder a la ruta
        const requiredProfiles = route.data['profiles'] || []; // Obtén los perfiles requeridos desde las rutas
        if (requiredProfiles.length && !requiredProfiles.some((profile: any) => userProfiles.includes(profile))) {
          // Si el usuario no tiene el perfil requerido, redirige o deniega el acceso
          router.navigate(['/inicio']); // Cambia a la ruta que desees
          return false;
        }
    
        return true; // Permite el acceso

  } else {
    sessionStorage.removeItem('token');
    router.navigate(['/login']);
    return false; // Deniega el acceso si no hay un token
  }
};


