import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabMenuModule } from 'primeng/tabmenu';
import { SoloLetrasDirective } from '../../../components/directives/solo-letras.directive';
import { TempDataService } from '../../../core/services/temp-data.service';
import { CelularPaisComponent } from '../../../components/resources/celular-pais/celular-pais.component';
import {
  COD_PAIS_PERU, TIPOS_DOC_DEFECTO, TipoDocumento, celularLimpio, celularValido, esPersonaNatural,
  limpiarNroDocumento, mensajeNroDocumento, nroDocumentoValido, reglaDocumento
} from '../../../core/utils/documento-pais';
import { SystemService } from '../../../core/services/system/system.service';
import { SelectModule } from 'primeng/select';
import { CerrarOverlayAlNavegarDirective } from '../../../components/directives/cerrar-overlay-al-navegar.directive';
import { FlowStepsComponent } from '../../../components/resources/flow-steps/flow-steps.component';
import { PASOS_PRESTAMO, PASOS_VEHICULAR } from '../../../core/utils/flujos';

@Component({
  selector: 'app-cliente-nuevo',
  standalone: true,
  imports: [CommonModule, TabMenuModule, FormsModule, ButtonModule, InputTextModule, SoloLetrasDirective, CelularPaisComponent, SelectModule, FlowStepsComponent, CerrarOverlayAlNavegarDirective],
  templateUrl: './cliente-nuevo.component.html',
  styleUrl: './cliente-nuevo.component.scss'
})
export default class ClienteNuevoComponent {

  persona = {
    // Datos del nuevo cliente si el idUsuario == NULL
    //idUsuario: null,
    codTipoDoc: null as string | null,   // opcional: DNI, C.E. o pasaporte
    nroDocumento: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    codPais: COD_PAIS_PERU,
    celular: "",
    direccion: ""
}
  clientSelect: boolean = false;

  constructor(
    private router: Router,
    private tempDataService: TempDataService,
    private systemService: SystemService,
  ){
    if(this.tempDataService.hasItem('persona')) {
      let temp = this.tempDataService.getItem<any>('persona');
      if(temp.idUsuario == null) this.persona = { ...this.persona, ...temp, codPais: temp.codPais || COD_PAIS_PERU };
    }

  }

  ngOnInit(): void{
    if(!this.tempDataService.hasItem('flow')) this.router.navigate(['inicio']);
    // El cliente es persona natural (nombres y apellidos): sin RUC
    this.systemService.tiposDocumento().subscribe(lista => this.tipoDocs = lista.filter(t => esPersonaNatural(t.codigo)));
    }

  tipoDocs: TipoDocumento[] = TIPOS_DOC_DEFECTO.filter(t => esPersonaNatural(t.codigo));

  /** Préstamo: paso 2 de 3. Vehicular: paso 1 de 3. */
  get esVehicular(): boolean {
    return this.tempDataService.hasItem('flow') && this.tempDataService.getItem<any>('flow') === 'vehicular';
  }
  get pasos(): string[] { return this.esVehicular ? PASOS_VEHICULAR : PASOS_PRESTAMO; }
  get pasoActual(): number { return this.esVehicular ? 1 : 2; }

  get reglaDoc() {
    return reglaDocumento(this.persona.codTipoDoc);
  }

  get mensajeNroDoc(): string {
    return mensajeNroDocumento(this.persona.codTipoDoc);
  }

  /** Eligió tipo pero el número falta o no cumple el formato. */
  get documentoIncompleto(): boolean {
    return !!this.persona.codTipoDoc && !!this.persona.nroDocumento
      && !nroDocumentoValido(this.persona.codTipoDoc, this.persona.nroDocumento);
  }

  onTipoDocChange() {
    this.persona.nroDocumento = '';
  }

  onNroDocumentoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const limpio = limpiarNroDocumento(this.persona.codTipoDoc, input.value);
    if (input.value !== limpio) input.value = limpio;
    this.persona.nroDocumento = limpio;
  }


  irDatosInversion(){
    this.tempDataService.setItem('persona',this.persona);

    if(this.tempDataService.hasItem('flow')) {
      let temp = this.tempDataService.getItem<any>('flow');
      if(temp==='vehicular') this.router.navigate(['vehicular/registro/datosinversion']);
      else if(temp==='prestamo') this.router.navigate(['registrar/confirmar']);
      else this.router.navigate(['inicio']);
    } else this.router.navigate(['inicio']);

    
    
  }

  /* Vista previa del cliente en la cabecera */
  get nombrePreview(): string {
    const p = this.persona;
    return [p.nombres, p.apellidoPaterno, p.apellidoMaterno].map(s => (s || '').trim()).filter(Boolean).join(' ');
  }

  get inicialesPreview(): string {
    const n = (this.persona.nombres || '').trim().charAt(0);
    const a = (this.persona.apellidoPaterno || '').trim().charAt(0);
    return (n + a).toUpperCase();
  }

  // Método para verificar si todos los campos obligatorios están llenos
  isFormValid(): boolean {
    return (
      this.persona.nombres.trim() !== '' &&
      this.persona.apellidoPaterno.trim() !== '' &&
      this.persona.apellidoMaterno.trim() !== '' &&
      this.persona.direccion?.trim() !== '' &&
      (!celularLimpio(this.persona.celular) || celularValido(this.persona.celular, this.persona.codPais)) &&
      // documento opcional, pero si se eligió el tipo el número debe ser válido
      (!this.persona.codTipoDoc || nroDocumentoValido(this.persona.codTipoDoc, this.persona.nroDocumento))
    );
}

}
