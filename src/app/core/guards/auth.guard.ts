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

        // Decodifica el perfil desde el token
        const userProfiles = decodedToken.codPerfil;
        // Decodifica los permisos desde el token
        const permisosUsuario = decodedToken.permisos;

        // ✅ Validación de perfiles (ya existente)
        const requiredProfiles = route.data['profiles'] || [];
        if (requiredProfiles.length && !requiredProfiles.some((profile: any) => userProfiles.includes(profile))) {
          router.navigate(['/inicio']);
          return false;
        }

        // ✅ Validación de permisos
        const requiredPermisos = route.data['permisos'] || [];
        if (requiredPermisos.length && !requiredPermisos.some((permisoRequerido: string) => 
          permisosUsuario.some((permisoUsuario: any) => permisoUsuario.codigo === permisoRequerido))) {
          router.navigate(['/inicio']);
          return false;
        }
    
        return true; // Permite el acceso

  } else {
    sessionStorage.removeItem('token');
    router.navigate(['/login']);
    return false; // Deniega el acceso si no hay un token
  }
};


