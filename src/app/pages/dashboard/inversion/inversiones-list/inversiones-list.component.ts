
import { Component, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { CommonModule } from '@angular/common';
import {PaginatorModule} from 'primeng/paginator';
import { SoloLetrasDirective } from '../../../../components/directives/solo-letras.directive';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ListEmptyComponent } from '../../../../components/resources/list-empty/list-empty.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-inversiones-list',
  standalone: true,
  imports: [TableModule, InputTextModule, TagModule, IconFieldModule, InputIconModule,AvatarModule,
    CommonModule,PaginatorModule,SoloLetrasDirective,InputGroupModule,InputGroupAddonModule,ListEmptyComponent
  ],
  templateUrl: './inversiones-list.component.html',
  styleUrl: './inversiones-list.component.scss'
})
export default class InversionesListComponent {

    customers!: any[];
    selectedInversion!: any;

    /* Filtro */
    value: string = '';
    open: boolean = true;

    /* Data en la tabla */
    listaInv: Array<any> = [];
    listPaginador: Array<any> = [];
    paginas: number = 0;
    paginaActual: number = 1;
    registrosPag: number = 8; //puede cambiar a necesidad
    isNext: boolean = true;
    isBack: boolean = false;
    temporalFilter: Array<any> = [];
    totalListCount: number = 0;

    constructor(
      private messageService: MessageService,
      private router: Router,
      private location: Location
    ){}
    
    ngOnInit(){
      this.listarInversiones();
      this.renderizarTablaData();
      this.calcularPaginas();
      console.log("temporal: "+this.value.toLowerCase());
    }

    listarInversiones(){
      //Se obtiene todo
      this.listaInv = this.data;
      //se filtra solo los abiertos
      console.log("tamaño: "+this.listaInv.length);
      //this.listPaginador = this.listaInv.filter((item: any) => item.estadoDeuda == "P");
    }

    clearFilter(){
      this.value = "";
      this.filtrarInversiones();
    }

        // Método para filtrar inversiones basado en el input
    filtrarInversiones() {
      const filterValue = this.value.toLowerCase().trim();
  
      // Filtrar según el valor del input
      this.temporalFilter = this.listaInv.filter(item => {
      return (
            item.nombres.toLowerCase().includes(filterValue) ||
            item.apellidoPaterno.toLowerCase().includes(filterValue) ||
            item.apellidoMaterno.toLowerCase().includes(filterValue)
              );
          });
        this.renderizarTablaData(); // Renderizar la tabla con los datos filtrados
        this.calcularPaginas(); // Recalcular las páginas después del filtrado
        console.log("temporal: "+this.temporalFilter.length);
        console.log("temporal: "+filterValue);
      }

    changeOpen(status: boolean){
      this.open = status;
      this.paginaActual = 1;
      this.isNext = true;
      this.isBack = false;
      this.renderizarTablaData();
      this.calcularPaginas();
      
    }

    calcularPaginas(){
      let lista = this.listaInv.filter((item: any) => this.open ? item.estadoDeuda == "P":item.estadoDeuda == "C");
      if(this.value!="") {
        lista = this.temporalFilter.filter((item: any) => this.open ? item.estadoDeuda == "P":item.estadoDeuda == "C");
      }
      let num = lista.length / this.registrosPag;
      this.paginas = num % 1 === 0 ? num : Math.ceil(num);
      console.log("paginas: "+this.paginas);
    }
    paginaAnterior(){
      this.paginaActual -= 1;
      if(this.paginaActual != this.paginas) this.isNext = true;
      if(this.paginaActual == 1) this.isBack = false;
      this.renderizarTablaData();
    }
    siguientePagina(){
      this.paginaActual += 1;
      if(this.paginaActual == this.paginas) this.isNext = false;
      if(this.paginaActual != 1) this.isBack = true;
      this.renderizarTablaData();
    }

    renderizarTablaData(){
      const init = this.registrosPag * (this.paginaActual - 1);
      const fini = this.registrosPag * this.paginaActual;
      let lista = this.listaInv.filter((item: any) => this.open ? item.estadoDeuda == "P":item.estadoDeuda == "C");
      if(this.value!="") {
        lista = this.temporalFilter.filter((item: any) => this.open ? item.estadoDeuda == "P":item.estadoDeuda == "C");
        this.calcularPaginas();
      }
      this.totalListCount = lista.length;
      console.log("lista count: "+lista.length);
      this.listPaginador = lista.slice(init,fini);
      console.log("______________________________");
      console.log("registro inicial: "+init);
      console.log("registro final: "+fini);
      console.log("pagina actual: "+this.paginaActual);
      console.log("total paginas: "+this.paginas);
      console.log("total elementos: "+this.listPaginador.length);
      console.log("______________________________");
    }

  // Función para obtener los colores para cada avatar
  getAvatarStyle(): { backgroundColor: string; color: string; fontWeight: string; padding: string} {
    const bgColor = this.getRandomColor();

    const textColor = bgColor.replace(",.2",""); // Puedes usar el mismo color o uno diferente
    return {
      backgroundColor: bgColor,
      color: textColor,
      fontWeight: '500',
      padding: '20px'
    };
  }
    // Función para generar un color hexadecimal aleatorio
    getRandomColor(): string {
      // Genera un valor aleatorio entre 0 y 255 para cada componente de color
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      
      // Devuelve el color en formato rgb
      return `rgb(${r}, ${g}, ${b},.2)`;
    }

    abrirCartilla(idInversion: number){
      this.router.navigate(['/inversion/cartilla'], {queryParams:{idInversion, from: 'list'}});
    }

    volver() {
      this.location.back();
    }
  


/*       recalcularEstilo() {
        const avatars = document.querySelectorAll('.avatar');
        avatars.forEach((avatar) => {
            // Casting a HTMLDivElement para que TypeScript reconozca la propiedad 'style'
            const divAvatar = avatar as HTMLDivElement;
            // Aplicar estilos directamente
            divAvatar.style.width = '30px';
            divAvatar.style.height = '30px';
            divAvatar.style.borderRadius = '50%';
            divAvatar.style.backgroundColor = 'var(--avatar-bg-color, #007bff)';
            divAvatar.style.color = '#334155';
            divAvatar.style.display = 'flex';
            divAvatar.style.alignItems = 'center';
            divAvatar.style.justifyContent = 'center';
            divAvatar.style.fontSize = '10px';
            divAvatar.style.fontWeight = 'bold';
            divAvatar.style.border = '2px solid #0056b3';
        });
    }
 */
    data: any = [
        {
            "idInversion": 6,
            "nombres": "Alex miguel angel",
            "apellidoPaterno": "casas",
            "apellidoMaterno": "Cabrejo",
            "estadoDeuda": "P",
            "nroInversion": 2,
            "fechaModificacion": "26 de feb. 2024 - 19:23 p. m.",
            "avatar": "AC"
        },
        {
            "idInversion": 7,
            "nombres": "Alex miguel angel",
            "apellidoPaterno": "casas",
            "apellidoMaterno": "Cabrejo",
            "estadoDeuda": "P",
            "nroInversion": 3,
            "fechaModificacion": "27 de feb. 2024 - 19:24 p. m.",
            "avatar": "AC"
        },
        {
            "idInversion": 8,
            "nombres": "Alex miguel angel",
            "apellidoPaterno": "casas",
            "apellidoMaterno": "Cabrejo",
            "estadoDeuda": "P",
            "nroInversion": 4,
            "fechaModificacion": "09 de jun. 2024 - 18:04 p. m.",
            "avatar": "AC"
        },
        {
            "idInversion": 21,
            "nombres": "Angela",
            "apellidoPaterno": "Vivanco",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "P",
            "nroInversion": 1,
            "fechaModificacion": "23 de mar. 2024 - 12:13 p. m.",
            "avatar": "AV"
        },
        {
            "idInversion": 22,
            "nombres": "Angela",
            "apellidoPaterno": "Vivanco",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "P",
            "nroInversion": 1,
            "fechaModificacion": "23 de mar. 2024 - 12:16 p. m.",
            "avatar": "AV"
        },
        {
            "idInversion": 23,
            "nombres": "Angela",
            "apellidoPaterno": "Vivanco",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "P",
            "nroInversion": 1,
            "fechaModificacion": "23 de mar. 2024 - 12:18 p. m.",
            "avatar": "AV"
        },
        {
            "idInversion": 24,
            "nombres": "Chachi",
            "apellidoPaterno": "Moto",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "C",
            "nroInversion": 1,
            "fechaModificacion": "23 de mar. 2024 - 12:21 p. m.",
            "avatar": "CM"
        },
        {
            "idInversion": 25,
            "nombres": "Chachi",
            "apellidoPaterno": "Moto",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "C",
            "nroInversion": 2,
            "fechaModificacion": "23 de mar. 2024 - 12:25 p. m.",
            "avatar": "CM"
        },
        {
            "idInversion": 19,
            "nombres": "Giovani",
            "apellidoPaterno": "Vivanco",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "P",
            "nroInversion": 1,
            "fechaModificacion": "23 de mar. 2024 - 11:37 a. m.",
            "avatar": "GV"
        },
        {
            "idInversion": 20,
            "nombres": "Giovanii",
            "apellidoPaterno": "Vivanco",
            "apellidoMaterno": "Torres",
            "estadoDeuda": "C",
            "nroInversion": 1,
            "fechaModificacion": "23 de mar. 2024 - 11:45 a. m.",
            "avatar": "GV"
        },
        {
            "idInversion": 3,
            "nombres": "Jose Octavio",
            "apellidoPaterno": "Cerron",
            "apellidoMaterno": "Vicente",
            "estadoDeuda": "C",
            "nroInversion": 1,
            "fechaModificacion": "27 de feb. 2024 - 18:17 p. m.",
            "avatar": "JC"
        },
        {
          "idInversion": 20,
          "nombres": "Giovanii",
          "apellidoPaterno": "Vivanco",
          "apellidoMaterno": "Torres",
          "estadoDeuda": "C",
          "nroInversion": 1,
          "fechaModificacion": "23 de mar. 2024 - 11:45 a. m.",
          "avatar": "GV"
      },
      {
          "idInversion": 3,
          "nombres": "Jose Octavio",
          "apellidoPaterno": "Cerron",
          "apellidoMaterno": "Vicente",
          "estadoDeuda": "C",
          "nroInversion": 1,
          "fechaModificacion": "27 de feb. 2024 - 18:17 p. m.",
          "avatar": "JC"
      },
      {
        "idInversion": 20,
        "nombres": "Giovanii",
        "apellidoPaterno": "Vivanco",
        "apellidoMaterno": "Torres",
        "estadoDeuda": "C",
        "nroInversion": 1,
        "fechaModificacion": "23 de mar. 2024 - 11:45 a. m.",
        "avatar": "GV"
    },
    {
        "idInversion": 3,
        "nombres": "Jose Octavio",
        "apellidoPaterno": "Cerron",
        "apellidoMaterno": "Vicente",
        "estadoDeuda": "C",
        "nroInversion": 1,
        "fechaModificacion": "27 de feb. 2024 - 18:17 p. m.",
        "avatar": "JC"
    },
        {
          "idInversion": 6,
          "nombres": "Alex miguel angel",
          "apellidoPaterno": "casas",
          "apellidoMaterno": "Cabrejo",
          "estadoDeuda": "P",
          "nroInversion": 2,
          "fechaModificacion": "26 de feb. 2024 - 19:23 p. m.",
          "avatar": "AC"
      },
      {
          "idInversion": 7,
          "nombres": "Alex miguel angel",
          "apellidoPaterno": "casas",
          "apellidoMaterno": "Cabrejo",
          "estadoDeuda": "P",
          "nroInversion": 3,
          "fechaModificacion": "27 de feb. 2024 - 19:24 p. m.",
          "avatar": "AC"
      },
      {
          "idInversion": 8,
          "nombres": "Alex miguel angel",
          "apellidoPaterno": "casas",
          "apellidoMaterno": "Cabrejo",
          "estadoDeuda": "P",
          "nroInversion": 4,
          "fechaModificacion": "09 de jun. 2024 - 18:04 p. m.",
          "avatar": "AC"
      },
      {
          "idInversion": 21,
          "nombres": "Angela",
          "apellidoPaterno": "Vivanco",
          "apellidoMaterno": "Torres",
          "estadoDeuda": "P",
          "nroInversion": 1,
          "fechaModificacion": "23 de mar. 2024 - 12:13 p. m.",
          "avatar": "AV"
      },
      {
          "idInversion": 22,
          "nombres": "Angela",
          "apellidoPaterno": "Vivanco",
          "apellidoMaterno": "Torres",
          "estadoDeuda": "P",
          "nroInversion": 1,
          "fechaModificacion": "23 de mar. 2024 - 12:16 p. m.",
          "avatar": "AV"
      },
      {
          "idInversion": 23,
          "nombres": "Angela",
          "apellidoPaterno": "Vivanco",
          "apellidoMaterno": "Torres",
          "estadoDeuda": "P",
          "nroInversion": 1,
          "fechaModificacion": "23 de mar. 2024 - 12:18 p. m.",
          "avatar": "AV"
      },
      {
          "idInversion": 24,
          "nombres": "Chachi",
          "apellidoPaterno": "Moto",
          "apellidoMaterno": "Torres",
          "estadoDeuda": "C",
          "nroInversion": 1,
          "fechaModificacion": "23 de mar. 2024 - 12:21 p. m.",
          "avatar": "CM"
      }
      ]

}
