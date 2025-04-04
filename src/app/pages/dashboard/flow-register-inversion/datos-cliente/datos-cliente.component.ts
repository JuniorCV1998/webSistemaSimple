import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { InversoresService } from '../../../../core/services/inversores/inversores.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-datos-cliente',
  standalone: true,
  imports: [ButtonModule,InputTextModule,CheckboxModule,
    CommonModule,FormsModule,NroCelularDirective,SoloLetrasDirective,
    CardModule,RadioButtonModule,InputTextareaModule,FloatLabelModule,ListboxModule,
    LoadingComponent,ToastModule],
  templateUrl: './datos-cliente.component.html',
  styleUrl: './datos-cliente.component.scss'
})
export default class DatosClienteComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  
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
    private location: Location,
    private inversoresService: InversoresService,
    private getInversionService: GetInversionService,
    private dialogService: DialogService,
    private router: Router
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
          this.objClient?.persona?.apellidoMaterno.trim() !== '' &&
          /* this.objClient.persona.celular.trim() !== '' && */
          this.objClient.persona.direccion.trim() !== ''
        );
    }

  registerInvFalse(){
    if(!this.isFormValid()) return;
    const objNuevaInv = {
        fkUsuario : this.statusClient==1?this.objClient?.idUsuario:null,
        // objeto inversion
        monto: this.objInversion.monto,
        nroCuotas: this.objInversion.nroCuotas,
        interes: this.objInversion.statusPersonalizado?this.objInversion.interesPerso:this.objInversion.interes,
        fechaInicio: this.objInversion.fechaInicio,
        fechaFin: this.objInversion.fechaFin,
        //comentario
        comentario: this.txtComentario.trim(),
        // objeto cliente
        nombres: this.objClient.persona.nombres.trim(),
        apellidoPaterno: this.objClient.persona.apellidoPaterno.trim(),
        apellidoMaterno: this.objClient.persona.apellidoMaterno.trim(),
        celular: this.objClient.persona.celular?.trim().replace(/\s+/g, ''),
        direccion: this.objClient.persona.direccion.trim(),
        // validate
        validado: false
    }
    this.serviceFalseRegisterInversion(objNuevaInv);
  }

  serviceFalseRegisterInversion(requestBody: any){
      this.loadingComponent.show();
      this.getInversionService.registerInversion(requestBody).pipe(
        finalize(() => this.loadingComponent.hide()),
        catchError((error) => {
          if (error.status === 400) {
            this.show(error.error.descripcion, Constantes.MSG_H_400); // Mensaje para 400
          } else {
            this.show(Constantes.MSG_500, Constantes.MSG_H_500); // Mensaje para otros errores
          }
          // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
          return of(null);
        })
      ).subscribe((resp: any) => {
        if (resp) {
          const messageData = {
            severity: 'success',
            summary: '¡DATOS VALIDADOS!',
            detail: resp.descripcion,
            life: 3000
          };
          const fechas = {
            fechaInicio: this.objInversion.fechaInicio,
            fechaFin: this.objInversion.fechaFin
          }

          sessionStorage.setItem('fechasInv', JSON.stringify(fechas));
          sessionStorage.setItem('objNuevaInv',JSON.stringify(resp.data));
          sessionStorage.setItem('lastMessage', JSON.stringify(messageData));
          this.router.navigate(['registrar/confirmar']);
        }
      });
  }

  show(message: string, header: string) {
    const ref = this.dialogService.open(MessagePopUpComponent, {
      data: {
        message: message
      },
      header: header,
      closable: false,
      closeOnEscape: false,
      modal: true,         
      width: '90%'
    });
    
    // Suscribirse al evento de cierre del diálogo
    ref.onClose.subscribe((result: any) => {
      if (result === 'aceptar') {
      }
    });
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
                if(this.listaClientes?.length === 0) this.functStatusClient(2);
                /* this.addFullNameList(); */
            }
        });
  }

  addFullNameList(){
    if(this.callFullName) return;
    // Mapear la lista para añadir fullName
    if (this.listaClientes?.length > 0) {
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

