import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/auth/login/login.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const loginService = inject(LoginService);
  const token = loginService.getToken();
  const tokenIsValid = loginService.isTokenValid();
  const router = inject(Router); // Inyecta el Router

  if (token) {
     // Permite el acceso si hay un token
    if(!tokenIsValid){
      sessionStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }else return true;

  } else {
    sessionStorage.removeItem('token');
    router.navigate(['/login']);
    return false; // Deniega el acceso si no hay un token
  }
};


