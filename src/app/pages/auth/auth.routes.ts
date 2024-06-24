import { Routes } from '@angular/router';
import { RegisterComponent } from "./register/register.component";
import { RegisterPersonalComponent } from "./register-personal/register-personal.component";
import { LoginComponent } from "./login/login.component";

export const AUTH_ROUTES: Routes = [
    /* {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }, */
    { path: '**', redirectTo: 'login' },  
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
    }
]