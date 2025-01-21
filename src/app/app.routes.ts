import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Constantes } from './core/constant/Constantes';

export const routes: Routes = [
    {
        path:'inicio',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/send-inicio/send-inicio.component'),
        data: { profiles: [Constantes.PERFIL_CLI, Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },
    {
        path:'listacompleta',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/dashboard/inicio/list-all/list-all.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Flujo de Authenticacion del Usuario */ 
    {
        path:'login',
        loadComponent:() => import('././pages/auth/login/login.component')
    },
    {
        path:'login-user',
        loadComponent:() => import('././pages/auth/login-user/login-user.component')
    },
    {
        path: 'registrar',
        loadComponent:() => import ('././pages/auth/register/register.component')
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
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },
    {
        path: 'registrar/datoscliente',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/datos-cliente/datos-cliente.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },
    {
        path: 'registrar/confirmar',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/confirm-inversion/confirm-inversion.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },
    {
        path: 'registrar/inversiondetalle',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/flow-register-inversion/inversion-registered/inversion-registered.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Componentes Inversion */
    {
        path: 'inversion/cartilla',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/inversion/inversion-detail/inversion-detail.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_CLI] }
    },
    {
        path: 'inversion/lista',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/dashboard/inversion/inversiones-list/inversiones-list.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Reportes */
    {
        path: 'reporte/reporte-cobranza',
        canActivate: [authGuard],
        loadComponent:() => import ('././pages/nav/collection-report/collection-report.component'),
        data: { profiles: [Constantes.PERFIL_INV] }
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
