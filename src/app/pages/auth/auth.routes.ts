import { Routes } from '@angular/router';
import { RegisterComponent } from "./register/register.component";
import { RegisterPersonalComponent } from "./register-personal/register-personal.component";
import { LoginComponent } from "./login/login.component";
import { InicioComponent } from '../dashboard/inicio/inicio.component';

export const AUTH_ROUTES: Routes = [
    /* {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }, */
     
    {
        path: 'login',
        component: LoginComponent
    },
    { 
        path: 'registrar',
        component: RegisterComponent
    },
    {
        path: 'registrar/personal',
        component: RegisterPersonalComponent
    },
    { path: '**', redirectTo: 'login' }
]