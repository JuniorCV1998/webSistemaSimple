import { Routes } from "@angular/router";
import { InicioComponent } from "./inicio/inicio.component";


export const DASHBOARD_ROUTES: Routes = [

     
    {
        path: '',
        component: InicioComponent
    },
    
    /* { path: '**', redirectTo: '' }, */
];