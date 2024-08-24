import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { CommonModule } from '@angular/common'; // Importa CommonModule
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TabMenuModule,CommonModule,TableModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export default class InicioComponent {
  constructor(private router: Router){}

  items: MenuItem[] | undefined;
  monto: any = 20000.00;
  mostrar: boolean = false;

  ultimasInversiones: any[] = [];

  ngOnInit() {
    this.ultimasInversiones = this.data;
    console.log("Data: "+ this.ultimasInversiones.length);

      this.items = [
          { label: 'Inicio', icon: 'pi pi-home' },
          /* { label: 'Inversiones', icon: 'pi pi-chart-line' }, */
          { label: 'Cuenta', icon: 'pi pi-list' }/* ,
          { label: 'Messages', icon: 'pi pi-inbox' } */
      ]
  }

  mostrarMonto(){
    this.mostrar = !this.mostrar;
  }

  verRegistros(){
    if(this.ultimasInversiones.length == 0){
      alert("No se encontraron registros. Por favor, actualice.")
    }
  }

/*   routerInversion(){
    this.router.navigate(['/inversion']);
  } */
  
  data = [
  {id:1, nombre: 'Jose Cerron Vicente', fecha: 'Hoy - 16:08 p.m.', monto: '1200.00'},
  {id:2, nombre: 'Alfredo Quispe Vicente', fecha: 'Hoy - 13:08 p.m.', monto: '1000.00'},
  {id:3, nombre: 'Angeles Casas Mia', fecha: 'Hoy - 10:08 a.m.', monto: '500.00'},
  {id:4, nombre: 'Junior Cerron Quispe', fecha: 'Ayer - 16:08 p.m.', monto: '750.00'},
  {id:5, nombre: 'Miguel Quispe Casas', fecha: 'Ayer - 16:08 p.m.', monto: '5000.00'},
  {id:6, nombre: 'William Sanchez Sanchez', fecha: '08 de feb. 2024 - 16:08 p.m.', monto: '10000.00'},
  {id:7, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  {id:8, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  {id:9, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  {id:10, nombre: 'Mayte Hinostroza Huayta', fecha: '01 de feb. 2024 - 16:08 p.m.', monto: '12000.00'},
  ]
}
