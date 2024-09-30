import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { Location } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { catchError, of } from 'rxjs';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Constantes } from '../../../../core/constant/Constantes';

@Component({
  selector: 'app-inversion-registered',
  standalone: true,
  imports: [ButtonModule,CommonModule,ToastModule,TabMenuModule],
  templateUrl: './inversion-registered.component.html',
  styleUrl: './inversion-registered.component.scss'
})
export default class InversionRegisteredComponent {

  idInversion: number | null = null;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private getInversionService: GetInversionService,
    private dialogService: DialogService
  ){}

  //Mostrar clave usuario
  mostrar: boolean = false;
  copy: boolean = false;

  objInversion: any = {
    "idInversion": 0,
    "monto": 0,
    "nombres": "",
    "apellidoPaterno": "",
    "apellidoMaterno": "",
    "correo": "",
    "contrasenaClient": "",
    "fechaCreacion": "",
    "codOperacion": ""
};

  ngOnInit(){
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversion');
      this.idInversion = id ? +id : null; // Convertir a número si existe
      console.log('ID de Inversión recibido:', this.idInversion);
    });
    // Recupera la información de la inversión
    this.getInversionRegistered();
    // Brinda efecto confetti
    this.triggerConfetti();
  }

  getInversionRegistered(){
    this.getInversionService.getInversionRegistered(this.idInversion===null?0:this.idInversion).pipe(
            // Manejamos errores de respuesta HTTP con catchError
            catchError((error) => {
                this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
              // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
              return of(null);
            })
    ).
    subscribe((resp: any)=> { 
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord==1) {
        console.log("obj: "+JSON.stringify(resp.data));
        this.objInversion = resp.data;
      }
      else if (resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord==0){
        this.show(resp.message, Constantes.MSG_SIN_REGISTROS,);
      }
      else if (resp.codigo==Constantes.CODIGO_ERROR_403){
        this.show(resp.descripcion, Constantes.MSG_GLOBAL);
      }
    }
  );}

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
        // Navegamos a la ruta deseada al aceptar
        this.router.navigate(['/inicio']);
      }
    });
}
  
  volver() {
    this.location.back();
  }

  async copyText(correo: string, contra: string): Promise<void> {
    try {
      var nombreCompleto = this.objInversion.nombres;
      var palabras = nombreCompleto.trim().split(' ');
      var texto = palabras[0]+", usa estas credenciales para iniciar sesión en el sistema:\n\n"+"Correo: "+correo +"\n"+"Contraseña: "+contra;
      await navigator.clipboard.writeText(texto);
      // Mostrar una notificación o mensaje opcional
      this.messageService.add({
        severity: 'info',
        summary: 'Copiar',
        detail: 'Texto copiado al portapapeles.',
        life: 3000
      });
    } catch (err) {
      // Manejar el error si la operación de copia falla
      this.messageService.add({
        severity: 'error',
        summary: 'Copiar',
        detail: 'Error al copiar al portapapeles.',
        life: 3000
      });
      console.error('Error al copiar al portapapeles:', err);
    }
  }

  triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#14b8a6', '#3b82f6']
    });
  }

  mostrarContrasena(){
    this.mostrar = !this.mostrar;
  }

  copyCredentials(){
    if(this.copy == false) this.copy = true;

    this.copyText(this.objInversion.correo, this.objInversion.contrasenaClient);
  }

}
