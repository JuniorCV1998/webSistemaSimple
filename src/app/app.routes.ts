import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path:'inicio',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inicio/inicio.component')
    },
    {
        path:'login',
        loadComponent:() => import('././pages/auth/login/login.component')
    },

    /* Flujo de Authenticacion del Usuario */
    {
        path: 'registrar',
        loadComponent:() => import ('././pages/auth/register/register.component')
/*         children:[
            {
                path: 'personal',
                title: '',
                loadComponent:() => import ('././pages/auth/register-personal/register-personal.component')
            }
        ] */
    },
    {
        path: 'registrar/personal',
        loadComponent:() => import ('././pages/auth/register-personal/register-personal.component')
    },

    /* Flujo de Registrar Inversion */
    {
        path: 'registrar/datosinversion',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/datos-inversion/datos-inversion.component'),
    },
    {
        path: 'registrar/datoscliente',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/datos-cliente/datos-cliente.component'),
    },
    {
        path: 'registrar/confirmar',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/confirm-inversion/confirm-inversion.component'),
    },
    {
        path: 'registrar/inversiondetalle',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/inversion-registered/inversion-registered.component'),
    },

    /* Componentes Inversion */
    {
        path: 'inversion/cartilla',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/inversion/inversion-detail/inversion-detail.component'),
    },
    {
        path: 'inversion/lista',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/inversion/inversiones-list/inversiones-list.component'),
    },



    {
        path: '',
        redirectTo: '/inicio',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/inicio',
        pathMatch: 'full'
    }

];
