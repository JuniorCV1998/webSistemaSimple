import { Routes } from '@angular/router';
import { Constantes } from './core/constant/Constantes';
import { authGuard } from './core/guards/auth.guard';
import { MembresiaExpComponent } from './pages/system/warning/membresia-exp/membresia-exp.component';
import { MembresiaVenComponent } from './pages/system/errores/membresia-ven/membresia-ven.component';
import { WithoutAccessComponent } from './pages/system/errores/without-access/without-access.component';
import { CodigoManualComponent } from './pages/system/informativo/codigo-manual/codigo-manual.component';
import { MantenimientoComponent } from './pages/system/informativo/mantenimiento/mantenimiento.component';
import { BlockBackGuard } from './core/guards/block-back';
import { UpdateAppComponent } from './pages/system/informativo/update-app/update-app.component';
import { PageHostComponent } from './core/ionic/page-host.component';

/*
 * NAVEGACIÓN CON IONIC
 * - Todas las pantallas se cargan dentro de PageHostComponent (data.page), que las vuelve a crear
 *   cada vez que se entra, igual que antes con <router-outlet>.
 * - Las pantallas principales (las de la barra de pestañas y las del menú "Más") son hijas de
 *   TabsComponent: se muestran con la barra inferior. La pestaña activa sale del primer segmento
 *   de la URL (inicio, clientes, reporte, whatsapp, perfil, ...).
 * - El resto (detalles, flujos de registro, login, pantallas del sistema) va en la pila raíz y se
 *   abre ENCIMA de las pestañas con la transición nativa de cada plataforma.
 * - Las URLs no cambiaron. Única excepción: Recordatorios WhatsApp ahora vive en /whatsapp (para
 *   tener su propia pestaña); /reporte/recordatorios-whatsapp redirige ahí.
 */
export const routes: Routes = [
    {
        path: '',
        redirectTo: '/inicio',
        pathMatch: 'full'
    },
    {
        path: 'reporte/recordatorios-whatsapp',
        redirectTo: '/whatsapp',
        pathMatch: 'full'
    },
    {
        path: 'reporte/rentabilidad',
        redirectTo: '/rentabilidad',
        pathMatch: 'full'
    },
    {
        path: 'reporte',
        redirectTo: '/reporte/pagos-pendientes',
        pathMatch: 'full'
    },

    /* ===== PANTALLAS CON BARRA DE PESTAÑAS ===== */
    {
        path: '',
        loadComponent: () => import('./pages/nav/tabs/tabs.component'),
        children: [
            {
                path: 'inicio',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/send-inicio/send-inicio.component'), profiles: [Constantes.PERFIL_CLI, Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
            },
            {
                path: 'clientes',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/inversor-flow/lista-clientes/lista-clientes.component'), profiles: [Constantes.PERFIL_INV] }
            },
            {
                path: 'reporte/pagos-pendientes',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/nav/collection-report/collection-report.component'), profiles: [Constantes.PERFIL_INV] }
            },
            {
                // Fuera de /reporte: Ionic toma el primer segmento como pila de la pestaña y la
                // dejaba dentro de "Cobranza" (marcaba esa pestaña y la recordaba como su última vista).
                path: 'rentabilidad',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/inversor-flow/profitability/profitability.component'), profiles: [Constantes.PERFIL_INV] }
            },
            {
                path: 'whatsapp',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/nav/recordatorios-whatsapp/recordatorios-whatsapp.component'), profiles: [Constantes.PERFIL_INV] }
            },
            {
                path: 'perfil',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/usuario/profile/profile.component'), profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_CLI] }
            },
            {
                path: 'inv/configuracion',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/inversor-flow/configuracion-inversor/configuracion-inversor.component'), profiles: [Constantes.PERFIL_INV] }
            },
            {
                path: 'configuracion-cliente',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/customer-flow/configuracion-cliente/configuracion-cliente.component'), profiles: [Constantes.PERFIL_CLI] }
            },
            {
                path: 'adm/configuracion',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/dashboard/admin-flow/configuracion-admin/configuracion-admin.component'), profiles: [Constantes.PERFIL_ADM] }
            },
            {
                path: 'vehicular/inicio',
                canActivate: [authGuard],
                component: PageHostComponent,
                data: { page: () => import('./pages/inv vehicular/inicio/inicio.component'), permisos: [Constantes.INV_VEHICULAR] }
            },
        ]
    },

    /* ===== PILA RAÍZ (se abren encima de las pestañas) ===== */
    {
        path: 'listacompleta',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/inicio/list-all/list-all.component'), profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Flujo de Authenticacion del Usuario */
    {
        path: 'login',
        component: PageHostComponent,
        data: { page: () => import('./pages/auth/login/login.component') }
    },
    {
        path: 'login-user',
        component: PageHostComponent,
        data: { page: () => import('./pages/auth/login-user/login-user.component') }
    },
    {
        path: 'validate',
        component: PageHostComponent,
        data: { page: () => import('./pages/auth/validate-public/validate-public.component') }
    },
    {
        path: 'registrar',
        component: PageHostComponent,
        data: { page: () => import('./pages/auth/register/register.component') }
    },
    {
        path: 'registrar/personal',
        component: PageHostComponent,
        data: { page: () => import('./pages/auth/register-personal/register-personal.component') }
    },

    /* Flujo de Registrar Inversion */
    {
        path: 'registrar/datosinversion',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/flow-register-inversion/datos-inversion/datos-inversion.component'), profiles: [Constantes.PERFIL_INV/* , Constantes.PERFIL_ADM */] }
    },
    {
        path: 'registrar/confirmar',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/flow-register-inversion/confirm-inversion/confirm-inversion.component'), profiles: [Constantes.PERFIL_INV/* , Constantes.PERFIL_ADM */] }
    },
    {
        path: 'registrar/inversiondetalle',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/flow-register-inversion/inversion-registered/inversion-registered.component'), profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Componentes Inversion */
    {
        path: 'inversion/cartilla',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/inversion/inversion-detail/inversion-detail.component'), profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_CLI, Constantes.PERFIL_ADM] }
    },
    {
        path: 'inversion/lista',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/inversion/inversiones-list/inversiones-list.component'), profiles: [Constantes.PERFIL_INV, Constantes.PERFIL_ADM] }
    },

    /* Reportes */
    {
        path: 'reporte/reporte-cobranza',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/inversion/reporte-cobranza/reporte-cobranza.component'), profiles: [Constantes.PERFIL_INV] }
    },

    /* Clientes */
    {
        path: 'cliente',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/inversor-flow/cliente-detail/cliente-detail.component'), profiles: [Constantes.PERFIL_INV] }
    },

    /* Inversión Vehicular */
    {
        path: 'vehicular/inversiondetalle',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/inv vehicular/detalle/detalle.component'), permisos: [Constantes.INV_VEHICULAR] }
    },
    {
        path: 'vehicular/cronograma',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/inv vehicular/cronograma-pago/cronograma-pago.component'), permisos: [Constantes.INV_VEHICULAR] }
    },
    {
        path: 'registro/datoscliente',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/resource/cliente/cliente.component'), profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'registro/clientenuevo',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/resource/cliente-nuevo/cliente-nuevo.component'), profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'vehicular/registro/datosinversion',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/inv vehicular/flow-register-vehicular/datos-inversion/datos-inversion.component'), permisos: [Constantes.INV_VEHICULAR], profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'vehicular/registro/confirmar',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/inv vehicular/flow-register-vehicular/confirm-inv/confirm-inv.component'), permisos: [Constantes.INV_VEHICULAR], profiles: [Constantes.PERFIL_INV] }
    },
    {
        path: 'vehicular/registro/inversiondetalle',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/inv vehicular/flow-register-vehicular/registered-inv/registered-inv.component'), permisos: [Constantes.INV_VEHICULAR], profiles: [Constantes.PERFIL_INV] }
    },

    /* PANTALLAS DEL SISTEMA */
    {
        path: 'membresia-exp',
        component: PageHostComponent,
        data: { page: () => Promise.resolve(MembresiaExpComponent) },
    },
    {
        path: 'membresia-ven',
        component: PageHostComponent,
        data: { page: () => Promise.resolve(MembresiaVenComponent) },
    },
    {
        path: 'usuario-sin-acceso',
        component: PageHostComponent,
        data: { page: () => Promise.resolve(WithoutAccessComponent) },
    },
    {
        path: 'codigo-manual',
        component: PageHostComponent,
        data: { page: () => Promise.resolve(CodigoManualComponent) },
    },
    {
        path: 'mantenimiento',
        component: PageHostComponent,
        data: { page: () => Promise.resolve(MantenimientoComponent) },
        canDeactivate: [BlockBackGuard]
    },
    {
        path: 'actualizar-app',
        component: PageHostComponent,
        data: { page: () => Promise.resolve(UpdateAppComponent) }
    },

    /* Pantallas para ADM */
    {
        path: 'adm/inversores',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/admin-flow/inversores-inversiones/inversores-inversiones.component'), profiles: [Constantes.PERFIL_ADM] }
    },
    {
        path: 'adm/perfil-inversor',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/admin-flow/profile-inversor/profile-inversor.component'), profiles: [Constantes.PERFIL_ADM] }
    },
    {
        path: 'adm/codigo-unico',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/admin-flow/codigo-unico/codigo-unico.component'), profiles: [Constantes.PERFIL_ADM] }
    },
    {
        path: 'adm/codigo-unico-list',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/admin-flow/codigo-unico-list/codigo-unico-list.component'), profiles: [Constantes.PERFIL_ADM] }
    },
    {
        path: 'adm/ajustes-sistema',
        canActivate: [authGuard],
        component: PageHostComponent,
        data: { page: () => import('./pages/dashboard/admin-flow/ajustes-sistema/ajustes-sistema.component'), profiles: [Constantes.PERFIL_ADM] }
    },

    {
        path: '**',
        redirectTo: '/inicio',
        pathMatch: 'full'
    }
];
