import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabMenuModule } from 'primeng/tabmenu';
import { NroCelularDirective } from '../../../../components/directives/nro-celular.directive';
import { SoloLetrasDirective } from '../../../../components/directives/solo-letras.directive';
import { TempDataService } from '../../../../core/services/temp-data.service';

@Component({
  selector: 'app-cliente-nuevo',
  standalone: true,
  imports: [CommonModule, TabMenuModule, FormsModule, ButtonModule, InputTextModule, NroCelularDirective,SoloLetrasDirective],
  templateUrl: './cliente-nuevo.component.html',
  styleUrl: './cliente-nuevo.component.scss'
})
export default class ClienteNuevoComponent {

  persona = {
    // Datos del nuevo cliente si el idUsuario == NULL
    //idUsuario: null,
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    celular: "",
    direccion: ""
}
  clientSelect: boolean = false;

  constructor(
    private router: Router,
    private tempDataService: TempDataService
  ){
    if(this.tempDataService.hasItem('persona')) {
      let temp = this.tempDataService.getItem<any>('persona');
      if(temp.idUsuario == null) this.persona = this.tempDataService.getItem<any>('persona');
    }
    
  }

  ngOnInit(): void{
    
    }


  irDatosInversion(){
    this.tempDataService.setItem('persona',this.persona);
    this.router.navigate(['vehicular/registro/datosinversion']);
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.persona.nombres.trim() !== '' &&
      this.persona.apellidoPaterno.trim() !== '' &&
      this.persona.apellidoMaterno.trim() !== '' &&
      this.persona.direccion?.trim() !== ''
    );
}

}
