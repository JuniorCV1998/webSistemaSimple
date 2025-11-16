import { Routes } from '@angular/router';
import { Constantes } from './core/constant/Constantes';
import { authGuard } from './core/guards/auth.guard';
import { MembresiaExpComponent } from './pages/system/warning/membresia-exp/membresia-exp.component';
import { MembresiaVenComponent } from './pages/system/errores/membresia-ven/membresia-ven.component';
import { WithoutAccessComponent } from './pages/system/errores/without-access/without-access.component';
import { CodigoManualComponent } from './pages/system/informativo/codigo-manual/codigo-manual.component';
import { MantenimientoComponent } from './pages/system/informativo/mantenimiento/mantenimiento.component';
import { BlockBackGuard } from './core/guards/block-back';

export const routes: Routes = [
    {
        path: 'inicio',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/send-inicio/send-inicio.component'),
        data: { profiles: [Constantes.PERFIL_CLI, Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },
    {
        path: 'listacompleta',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/dashboard/inicio/list-all/list-all.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Flujo de Authenticacion del Usuario */
    {
        path: 'login',
        loadComponent: () => import('././pages/auth/login/login.component')
    },
    {
        path: 'login-user',
        loadComponent: () => import('././pages/auth/login-user/login-user.component')
    },
    {
        path: 'validate',
        loadComponent: () => import('././pages/auth/validate-public/validate-public.component')
    },
    {
        path: 'registrar',
        loadComponent: () => import('././pages/auth/register/register.component')
    },
    {
        path: 'registrar/personal',
        loadComponent: () => import('././pages/auth/register-personal/register-personal.component')
    },

    /* Flujo de Registrar Inversion */
    {
        path: 'registrar/datosinversion',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/flow-register-inversion/datos-inversion/datos-inversion.component'),
        data: { profiles: [Constantes.PERFIL_INV/* , Constantes.PERFIL_ADM */] }
    },
    {
        path: 'registrar/confirmar',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/flow-register-inversion/confirm-inversion/confirm-inversion.component'),
        data: { profiles: [Constantes.PERFIL_INV/* , Constantes.PERFIL_ADM */] }
    },
    {
        path: 'registrar/inversiondetalle',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/flow-register-inversion/inversion-registered/inversion-registered.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Componentes Inversion */
    {
        path: 'inversion/cartilla',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inversion/inversion-detail/inversion-detail.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_CLI, Constantes.PERFIL_ADM] }
    },
    {
        path: 'inversion/lista',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inversion/inversiones-list/inversiones-list.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Reportes */
    {
        path: 'reporte/reporte-cobranza',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/nav/collection-report/collection-report.component'),
        data: { profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'reporte/rentabilidad',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inversor-flow/profitability/profitability.component'),
        data: { profiles: [Constantes.PERFIL_INV] }
    },

    /* Clientes */
    {
        path: 'clientes',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inversor-flow/lista-clientes/lista-clientes.component'),
        data: { profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'inv/configuracion',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inversor-flow/configuracion-inversor/configuracion-inversor.component'),
        data: { profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'cliente',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/inversor-flow/cliente-detail/cliente-detail.component'),
        data: { profiles: [Constantes.PERFIL_INV] }
    },

    /* Clientes */
    {
        path: 'perfil',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/usuario/profile/profile.component'),
        data: { profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_CLI] }
    },


    /* Inversión Vehicular */
    {
        path: 'vehicular/inicio',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/inv vehicular/inicio/inicio.component'),
        data: { permisos: [Constantes.INV_VEHICULAR], animation: 'fade' }
    },

    {
        path: 'vehicular/inversiondetalle',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/inv vehicular/detalle/detalle.component'),
        data: { permisos: [Constantes.INV_VEHICULAR] }
    },

    {
        path: 'registro/datoscliente',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/resource/cliente/cliente.component'),
        data: { profiles: [Constantes.PERFIL_INV], animation: 'slideRight' }
    },

    {
        path: 'registro/clientenuevo',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/resource/cliente-nuevo/cliente-nuevo.component'),
        data: { profiles: [Constantes.PERFIL_INV], animation: 'fade' }
    },

    {
        path: 'vehicular/registro/datosinversion',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/inv vehicular/flow-register-vehicular/datos-inversion/datos-inversion.component'),
        data: { permisos: [Constantes.INV_VEHICULAR], profiles: [Constantes.PERFIL_INV] }
    },

    {
        path: 'vehicular/registro/confirmar',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/inv vehicular/flow-register-vehicular/confirm-inv/confirm-inv.component'),
        data: { permisos: [Constantes.INV_VEHICULAR], profiles: [Constantes.PERFIL_INV], animation: 'slideRight' }
    },

    {
        path: 'vehicular/registro/inversiondetalle',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/inv vehicular/flow-register-vehicular/registered-inv/registered-inv.component'),
        data: { permisos: [Constantes.INV_VEHICULAR], profiles: [Constantes.PERFIL_INV], animation: 'fade' }
    },


    /* PANTALLAS DEL SISTEMA */
    {
        path: 'membresia-exp',
        component: MembresiaExpComponent,
        data: { animation: 'slideRight' },
    },
    {
        path: 'membresia-ven',
        component: MembresiaVenComponent,
        data: { animation: 'slideRight' },
    },
    {
        path: 'usuario-sin-acceso',
        component: WithoutAccessComponent,
        data: { animation: 'slideRight' },
    }, 
    {
        path: 'codigo-manual',
        component: CodigoManualComponent,
        data: { animation: 'slideRight' },
    }, 
    {
        path: 'mantenimiento',
        component: MantenimientoComponent,
        data: { animation: 'slideRight' },
        canDeactivate: [BlockBackGuard]
    },

    /* Pantallas para ADM */
    {
        path: 'adm/inversores',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/admin-flow/inversores-inversiones/inversores-inversiones.component'),
        data: { profiles: [Constantes.PERFIL_ADM], animation: 'fade' }
    },
    {
        path: 'adm/perfil-inversor',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/admin-flow/profile-inversor/profile-inversor.component'),
        data: { profiles: [Constantes.PERFIL_ADM], animation: 'fade' }
    },
    {
        path: 'adm/codigo-unico',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/admin-flow/codigo-unico/codigo-unico.component'),
        data: { profiles: [Constantes.PERFIL_ADM], animation: 'fade' }
    },
    {
        path: 'adm/codigo-unico-list',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/admin-flow/codigo-unico-list/codigo-unico-list.component'),
        data: { profiles: [Constantes.PERFIL_ADM], animation: 'fade' }
    },
    {
        path: 'adm/configuracion',
        canActivate: [authGuard],
        loadComponent: () => import('././pages/dashboard/admin-flow/configuracion-admin/configuracion-admin.component'),
        data: { profiles: [Constantes.PERFIL_ADM], animation: 'fade' }
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


    /* ANIMATION */
    /*     animation: 'slideUp' desliza arriba,
        animation: 'slideRight' desliza derecha,
        animation: 'fade' -> desvanecer,
        animation: 'zoom' ->  */

];
