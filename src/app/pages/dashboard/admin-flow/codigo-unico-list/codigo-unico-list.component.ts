import { Component } from '@angular/core';
import { AdminService } from '../../../../core/services/admin/admin.service';
import { finalize } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LongPressDirective } from '../../../../components/directives/long-press.directive';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-codigo-unico-list',
  standalone: true,
  imports: [SkeletonModule, RouterLink,CommonModule,LongPressDirective,ButtonModule],
  templateUrl: './codigo-unico-list.component.html',
  styleUrl: './codigo-unico-list.component.scss'
})
export default class CodigoUnicoListComponent {

  /* Codigo Unico */
  codigosUnicos: any = [];
  mostrarCodUnicos: boolean = false;
  forSkeleton: number = 5;
  skeletonShow: boolean = true;

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit(): void{
    this.listarCodUnico();
  }

  listarCodUnico() {
    this.mostrarCodUnicos = !this.mostrarCodUnicos;
    this.skeletonShow = true;

    this.adminService.getCodigosUnicos("ALL").pipe(
      finalize(() => this.skeletonShow = false)).
      subscribe((resp: any) => {
        //this.codigosUnicos = resp;

        this.codigosUnicos = this.temporal;
      });
  }

  detailCodigoUnico() {
    console.log("Este detalle");
  }

    temporal: any = [
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778385",
      "codigo": "SS-000084",
      "correo": "jcerronvicente@gmail.com",
      "estado": "I",
      "fechaCreacion": "Ayer - 12:54 p. m.",
      "fechaActualizacion": "Ayer - 12:57 p. m."
    },
    {
      "nroDocumento": "12345678",
      "codigo": "SS-000083",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:08 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "12222222",
      "codigo": "SS-000082",
      "correo": "asd1@gmail.com",
      "estado": "A",
      "fechaCreacion": "Ayer - 06:03 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "61502521",
      "codigo": "SS-000081",
      "correo": "jcerronvicente@gmail.com",
      "estado": "A",
      "fechaCreacion": "25 de set. 2025 - 11:18 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778383",
      "codigo": "SS-000080",
      "correo": "sayuri@gmail.com",
      "estado": "A",
      "fechaCreacion": "14 de set. 2025 - 10:57 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778382",
      "codigo": "SS-000076",
      "correo": "soporte@ssimple.com",
      "estado": "I",
      "fechaCreacion": "11 de set. 2025 - 09:05 a. m.",
      "fechaActualizacion": "14 de set. 2025 - 15:36 p. m."
    },
    {
      "nroDocumento": "20000000001",
      "codigo": "SS-000075",
      "correo": "20000000001@gmail.com",
      "estado": "I",
      "fechaCreacion": "08 de set. 2025 - 13:53 p. m.",
      "fechaActualizacion": "08 de set. 2025 - 13:54 p. m."
    },
    {
      "nroDocumento": "10000003",
      "codigo": "SS-000074",
      "correo": "10000003@gmail.com",
      "estado": "I",
      "fechaCreacion": "08 de set. 2025 - 13:48 p. m.",
      "fechaActualizacion": "08 de set. 2025 - 13:49 p. m."
    },
    {
      "nroDocumento": "10000002",
      "codigo": "SS-000073",
      "correo": "10000002@gmail.com",
      "estado": "I",
      "fechaCreacion": "08 de set. 2025 - 13:45 p. m.",
      "fechaActualizacion": "26 de set. 2025 - 12:53 p. m."
    },
    {
      "nroDocumento": "10000001",
      "codigo": "SS-000072",
      "correo": "10000001@gmail.com",
      "estado": "I",
      "fechaCreacion": "08 de set. 2025 - 13:03 p. m.",
      "fechaActualizacion": "08 de set. 2025 - 13:05 p. m."
    },
    {
      "nroDocumento": "20610085955",
      "codigo": "SS-000071",
      "correo": "oficialruc@gmail.com",
      "estado": "I",
      "fechaCreacion": "07 de set. 2025 - 13:39 p. m.",
      "fechaActualizacion": "08 de set. 2025 - 12:46 p. m."
    },
    {
      "nroDocumento": "61507522",
      "codigo": "SS-000070",
      "correo": "oficial@gmail.com",
      "estado": "I",
      "fechaCreacion": "07 de set. 2025 - 10:10 a. m.",
      "fechaActualizacion": "07 de set. 2025 - 11:30 a. m."
    },
    {
      "nroDocumento": "61507521",
      "codigo": "SS-000069",
      "correo": "oficial2@gmail.com",
      "estado": "A",
      "fechaCreacion": "07 de set. 2025 - 08:38 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778389",
      "codigo": "SS-000067",
      "correo": "oficial@gmail.com",
      "estado": "A",
      "fechaCreacion": "07 de set. 2025 - 08:18 a. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70778381",
      "codigo": "SS-000001",
      "correo": null,
      "estado": "I",
      "fechaCreacion": "06 de set. 2025 - 13:08 p. m.",
      "fechaActualizacion": ""
    },
    {
      "nroDocumento": "70707071",
      "codigo": "SS-000049",
      "correo": "create@gmail.com",
      "estado": "I",
      "fechaCreacion": "31 de ago. 2025 - 19:32 p. m.",
      "fechaActualizacion": "26 de set. 2025 - 12:45 p. m."
    },
    {
      "nroDocumento": "70707070",
      "codigo": "SS-000041",
      "correo": null,
      "estado": "I",
      "fechaCreacion": "31 de ago. 2025 - 16:29 p. m.",
      "fechaActualizacion": ""
    }
  ]

}
