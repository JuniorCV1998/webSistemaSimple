import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { NroCelularDirective } from '../../../../components/directives/nro-celular.directive';
import { SoloLetrasDirective } from '../../../../components/directives/solo-letras.directive';
import { CardModule } from 'primeng/card';
import {  Router, Routes } from '@angular/router';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ListboxModule } from 'primeng/listbox';

@Component({
  selector: 'app-datos-cliente',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,
    CommonModule,FormsModule,NroCelularDirective,SoloLetrasDirective,
    CardModule,RadioButtonModule,InputTextareaModule,FloatLabelModule,ListboxModule],
  templateUrl: './datos-cliente.component.html',
  styleUrl: './datos-cliente.component.scss'
})
export default class DatosClienteComponent {

  statusClient: number = 1;

  //Clientes
  listaClientes: any = [];
  //showOptions: boolean = true;
  clientSelect: boolean = true;
  objClient: any = {
    "persona": {
        "nombres": "",
        "apellidoPaterno": "",
        "apellidoMaterno": "",
        "celular": "",
        "direccion": "",
        "fullName": ""
    }
}; // cliente seleccionado

  //Comentario
  txtComentario: string = '';

  constructor(private router: Router){}

  ngOnInit(){
    this.obtenerListaClientes();
    
  }
  

  metodoMostrar(num: number){
  }

  functStatusClient(n: number){
    this.statusClient = n;
    this.clientSelect = !this.clientSelect;
    this.objClient = {
          "persona": {
              "nombres": "",
              "apellidoPaterno": "",
              "apellidoMaterno": "",
              "celular": "",
              "direccion": "",
              "fullName": ""
          }
      };
  }

    // Método para verificar si todos los campos obligatorios están llenos
    isFormValid(): boolean {
        return (
          this.objClient.persona.nombres.trim() !== '' &&
          this.objClient.persona.apellidoPaterno.trim() !== '' &&
          this.objClient.persona.apellidoMaterno.trim() !== '' &&
          this.objClient.persona.celular.trim() !== '' &&
          this.objClient.persona.direccion.trim() !== ''
        );
    }

  registerInvFalse(){
    this.router.navigate(['registrar/confirmar']);
  }

  obtenerListaClientes(){
    this.listaClientes = [
        {
            "idUsuario": 12,
            "persona": {
                "idPersona": 12,
                "nombres": "Aleatorio User 2",
                "apellidoPaterno": "User",
                "apellidoMaterno": "User2",
                "celular": "99999999",
                "direccion": "URB. camacho Mx g Lt 2"
            },
            "correo": "aleatorio2@gmail.com",
            "contrasenaClient": "admin",
            "acceso": "S"
        },
        {
            "idUsuario": 14,
            "persona": {
                "idPersona": 14,
                "nombres": "Jose Octavio",
                "apellidoPaterno": "Cerron",
                "apellidoMaterno": "Vicente",
                "celular": "921754924",
                "direccion": "AAHH. LAS VIAS DE LOS MILAGROS MZ J LT 6"
            },
            "correo": "correo@gmail.com",
            "contrasenaClient": "admin",
            "acceso": "S"
        },
        {
            "idUsuario": 21,
            "persona": {
                "idPersona": 21,
                "nombres": "Giovani",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovani21@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 22,
            "persona": {
                "idPersona": 22,
                "nombres": "Giovani",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovani22@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 23,
            "persona": {
                "idPersona": 23,
                "nombres": "Giovani",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovani23@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 24,
            "persona": {
                "idPersona": 24,
                "nombres": "Giovani",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovani24@ssimple.com",
            "contrasenaClient": "24giova230",
            "acceso": "S"
        },
        {
            "idUsuario": 25,
            "persona": {
                "idPersona": 25,
                "nombres": "Giovanii",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovanii25@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 26,
            "persona": {
                "idPersona": 26,
                "nombres": "Giovaniii",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovaniii26@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 27,
            "persona": {
                "idPersona": 27,
                "nombres": "Giovaniii",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "giovaniii27@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 28,
            "persona": {
                "idPersona": 28,
                "nombres": "alexandra",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "alexandra28@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 29,
            "persona": {
                "idPersona": 29,
                "nombres": "alexandra",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "alexandra29@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 30,
            "persona": {
                "idPersona": 30,
                "nombres": "alexandra",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "alexandra30@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 31,
            "persona": {
                "idPersona": 31,
                "nombres": "rosas",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "rosas31@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 32,
            "persona": {
                "idPersona": 32,
                "nombres": "rosas",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "rosas32@ssimple.com",
            "contrasenaClient": "admin",
            "acceso": "S"
        },
        {
            "idUsuario": 33,
            "persona": {
                "idPersona": 33,
                "nombres": "rosas",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "rosas33@ssimple.com",
            "contrasenaClient": null,
            "acceso": "S"
        },
        {
            "idUsuario": 34,
            "persona": {
                "idPersona": 34,
                "nombres": "Angela",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "angela34@ssimple.com",
            "contrasenaClient": "34angel230",
            "acceso": "S"
        },
        {
            "idUsuario": 35,
            "persona": {
                "idPersona": 35,
                "nombres": "Angela",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "angela35@ssimple.com",
            "contrasenaClient": "35angel230",
            "acceso": "S"
        },
        {
            "idUsuario": 36,
            "persona": {
                "idPersona": 36,
                "nombres": "Angela",
                "apellidoPaterno": "Vivanco",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "angela36@ssimple.com",
            "contrasenaClient": "36angel230",
            "acceso": "S"
        },
        {
            "idUsuario": 37,
            "persona": {
                "idPersona": 37,
                "nombres": "Chachi",
                "apellidoPaterno": "Moto",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "chachi37@ssimple.com",
            "contrasenaClient": "37chach230",
            "acceso": "S"
        },
        {
            "idUsuario": 42,
            "persona": {
                "idPersona": 42,
                "nombres": "Wuanyilo",
                "apellidoPaterno": "Moto",
                "apellidoMaterno": "Torres",
                "celular": "909090999",
                "direccion": "cañete de lima"
            },
            "correo": "wuanyilo42@ssimple.com",
            "contrasenaClient": "42wuany300",
            "acceso": "S"
        }
    ];

        // Mapear la lista para añadir fullName
        this.listaClientes = this.listaClientes.map((cliente: any) => {
          return {
              ...cliente,
              persona: {
                  ...cliente.persona,
                  fullName: `${cliente.persona.nombres} ${cliente.persona.apellidoPaterno}`
              }
          };
      });
      
  }
    
}

