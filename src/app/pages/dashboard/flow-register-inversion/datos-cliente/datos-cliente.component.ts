import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { NroCelularDirective } from '../../../../components/directives/nro-celular.directive';
import { SoloLetrasDirective } from '../../../../components/directives/solo-letras.directive';
import { CardModule } from 'primeng/card';
import {  Router } from '@angular/router';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ListboxModule } from 'primeng/listbox';
import { Location } from '@angular/common';
import { catchError, delay, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { InversoresService } from '../../../../core/services/inversores/inversores.service';

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
  listaCargada: boolean = false;
  callFullName: boolean = false;
  //showOptions: boolean = true;
  clientSelect: boolean = true;

  objClient: any | null = null  // cliente seleccionado

  //Comentario
  txtComentario: string = '';

  //Obj inversion
  objInversion: any = {};

  constructor(
    private router: Router,
    private location: Location,
    private inversoresService: InversoresService
){
    // recuperando objeto inversion
    const obj = sessionStorage.getItem('objInversion');
    if(obj) {
      this.objInversion = JSON.parse(obj);
    }
    // iniciando obj cliente
    this.objClient = {
        idUsuario: null,
        persona: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            celular: "",
            direccion: "",
            fullName: ""
        },
        correo: "",
        contrasenaClient: "",
        acceso: ""
    };
}

  ngOnInit(): void{
    this.obtenerListaClientes();
    console.log("objeto recuperado: " + JSON.stringify(this.objInversion));

  }

  ngAfterViewInit(): void {
    //this.obtenerListaClientes();
    this.addFullNameList();
  }

  volver() {
    this.location.back();
    }

  functStatusClient(n: number){
    this.statusClient = n;
    this.clientSelect = !this.clientSelect;
    this.objClient = {
        idUsuario: null,
        persona: {
            nombres: "",
            apellidoPaterno: "",
            apellidoMaterno: "",
            celular: "",
            direccion: "",
            fullName: ""
        },
        correo: "",
        contrasenaClient: "",
        acceso: ""
      };
  }

    // Método para verificar si todos los campos obligatorios están llenos
    isFormValid(): boolean {
        return (
          this.objClient?.persona?.nombres.trim() !== '' &&
          this.objClient?.persona?.apellidoPaterno.trim() !== '' &&
          this.objClient?.persona?.apellidoMaterno.trim() !== '' /* &&
          this.objClient.persona.celular.trim() !== '' &&
          this.objClient.persona.direccion.trim() !== '' */
        );
    }

  registerInvFalse(){
    if(!this.isFormValid()) return;
    const objNuevaInv = {
        fkUsuario : this.statusClient==1?this.objClient?.idUsuario:null,
        // objeto inversion
        monto: this.objInversion.monto,
        nroCuotas: this.objInversion.nroCuotas,
        interes: this.objInversion.interes,
        fechaInicio: this.objInversion.fechaInicio,
        fechaFin: this.objInversion.fechaFin,
        valorCuota: this.objInversion.valorCuota,
        //comentario
        comentario: this.txtComentario.trim(),
        // objeto cliente
        nombres: this.objClient.persona.nombres.trim(),
        apellidoPaterno: this.objClient.persona.apellidoPaterno.trim(),
        apellidoMaterno: this.objClient.persona.apellidoMaterno.trim(),
        celular: this.formatCelular(this.objClient.persona.celular.trim()),
        direccion: this.objClient.persona.direccion.trim(),
        // validate
        validado: false
    }
    sessionStorage.setItem('objNuevaInv',JSON.stringify(objNuevaInv));
    this.router.navigate(['registrar/confirmar']);
  }

  obtenerListaClientes(){
        this.inversoresService.getMyClients().pipe(
        finalize(() => this.listaCargada = true ),
        catchError((error) => {
            this.listaClientes = [];
        return of(null); 
        })
        ).subscribe((resp: any) => {
            if (resp && resp.codigoMessage === Constantes.STATUS_SUCCESS_RI) {
                this.listaClientes = resp.data;
            }
        });
  }

  addFullNameList(){
    if(this.callFullName) return;
    // Mapear la lista para añadir fullName
    if (this.listaClientes.length > 0) {
        this.listaClientes = this.listaClientes.map((cliente: any) => {
            return {
                ...cliente,
                persona: {
                    ...cliente.persona,
                    fullName: `${cliente.persona.nombres} ${cliente.persona.apellidoPaterno}`
                }
            };
        });
    this.callFullName = true;
    }
  }

  formatCelular(input: string): string {
    const value = input.replace(' ','');
    return value.replace(/[^0-9]/g, ''); // Eliminar cualquier carácter no numérico
  }
    
}

