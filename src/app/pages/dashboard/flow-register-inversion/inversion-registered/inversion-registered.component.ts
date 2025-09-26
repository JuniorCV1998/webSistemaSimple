import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import confetti from 'canvas-confetti';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { Location } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { catchError, finalize, of } from 'rxjs';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Constantes } from '../../../../core/constant/Constantes';
import { LoadingComponent } from '../../../modal/loading/loading.component';

@Component({
  selector: 'app-inversion-registered',
  standalone: true,
  imports: [ButtonModule,CommonModule,ToastModule,TabMenuModule,LoadingComponent,RouterModule],
  templateUrl: './inversion-registered.component.html',
  styleUrl: './inversion-registered.component.scss'
})
export default class InversionRegisteredComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  idInversion: number | null = null;
  confetti: boolean = false;

  isLoading: boolean = true;

  constructor(
    private messageService: MessageService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private getInversionService: GetInversionService,
    private dialogService: DialogService
  ){
    const obj = sessionStorage.getItem('confetti');
    if(obj) {
      this.confetti = JSON.parse(obj);
    }
  }

  //Mostrar clave usuario
  mostrar: boolean = false;
  copy: boolean = false;

  objInversion: any = {
    "idInversion": 0,
    "monto": "",
    "nombres": "",
    "apellidoPaterno": "",
    "apellidoMaterno": "",
    "correo": "",
    "contrasenaClient": "",
    "fechaCreacion": "",
    "codOperacion": ""
};

  ngOnInit(): void{
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversion');
      this.idInversion = id ? +id : null; // Convertir a número si existe
    });

    setTimeout(() => {
      this.loadingComponent.show();
      this.getInversionRegistered();
  });
  }

  ngAfterViewInit(): void{
    // Brinda efecto confetti
  }

  getInversionRegistered(){
    this.getInversionService.getInversionRegistered(this.idInversion===null?0:this.idInversion).pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
        this.triggerConfetti();
      }),
            // Manejamos errores de respuesta HTTP con catchError
            catchError((error) => {
              this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
              return of(null);
            })
    ).
    subscribe((resp: any)=> { 
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord==1) {
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

  async copyText(correo: string, contra: string): Promise<void> {
    try {
      var nombreCompleto = this.objInversion.nombres;
      var palabras = nombreCompleto.trim().split(' ');
      // Uso de la función
      var texto = palabras.length > 0 ? palabras[0] + ", usa estas credenciales para iniciar sesión en el sistema:\n\n" + "Correo: " + correo + "\n" + "Contraseña: " + contra : "Hola, usa estas credenciales para iniciar sesión en el sistema:\n\n" + "Correo: " + correo + "\n" + "Contraseña: " + contra;

      this.copyToClipboard(texto);
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
    if(!this.confetti) return;
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

  copyToClipboard(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

}
