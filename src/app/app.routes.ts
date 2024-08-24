import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { RegisterPersonalComponent } from './pages/auth/register-personal/register-personal.component';
import { InicioComponent } from './pages/dashboard/inicio/inicio.component';

export const routes: Routes = [
    {
        path:'inicio',
        loadChildren: () => import('./pages/dashboard/auth.routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path:'',
        loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
    },

];
