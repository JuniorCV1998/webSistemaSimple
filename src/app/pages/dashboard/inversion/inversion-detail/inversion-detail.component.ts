import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule  } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { GetInversionService } from '../../../../core/services/inversion/get-inversion.service';
import { Constantes } from '../../../../core/constant/Constantes';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';
import { catchError, finalize, of } from 'rxjs';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { LoginService } from '../../../../core/services/auth/login/login.service';

@Component({
  selector: 'app-inversion-detail',
  standalone: true,
  imports: [ButtonModule,CommonModule,ToastModule,TabMenuModule,ConfirmDialogModule,CalendarModule,FormsModule,
    LoadingComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './inversion-detail.component.html',
  styleUrl: './inversion-detail.component.scss'
})
export default class InversionDetailComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;
  isLoading: boolean = true;
  
  idInversion: number | null = null;
  //Mostrar clave usuario
  mostrar: boolean = false;
  copy: boolean = false;
  //inversion detail
  nroCuotas: number = 24;
  nroCuotasPendientes = 0;
  //Fecha a pagar
  date: Date = new Date();
  // cod perfil
  codPerfil: string = '';

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private location: Location,
    private getInversionService: GetInversionService,
    public dialogService: DialogService,
    private router: Router,
    private viewportScroller: ViewportScroller,
    private loginService: LoginService
  ){
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      this.codPerfil = decodedToken.codPerfil;
    }
  }

  numero: number = 0;

  ngOnInit(): void{
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversion');
      this.idInversion = id ? +id : null; // Convertir a número si existe
    });
    /* detall de inversion */
    setTimeout(() => {
      this.loadingComponent.show();
      this.getInversionesDetail();
  });
  }
  
  ngAfterViewInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  getInversionesDetail(){
    /* this.loadingComponent.show(); */
    this.getInversionService.getInversionesDetail(this.idInversion===null?0:this.idInversion).pipe(
      finalize(() => {
        this.loadingComponent.hide();
        this.isLoading = false; // Cambia a falso cuando termine
      }),
        // Manejamos errores de respuesta HTTP con catchError
        catchError((error) => {
        console.error('Error capturado:', error);
        // Aquí manejamos los diferentes errores HTTP (400, 403, 500, etc.)
        if (error.status === 403) {
          this.show('Acceso denegado', Constantes.MSG_GLOBAL); // Mensaje para 403
        } else if (error.status === 500) {
          this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para 500
        } else {
          this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
        }
          // Devuelve un observable vacío o con un valor específico para continuar con la lógica sin romper la aplicación
          return of(null);
        })
    ).
    subscribe((resp: any)=> { 
      if(resp.codigoMessage==Constantes.STATUS_SUCCESS_RI && resp.totalRecord==1) {
        this.objInvDetail = resp.data;
        this.nroCuotas = resp.data.nroCuotas;
        this.calcularCuotasPendientes();
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

  mostrarContrasena(){
    this.mostrar = !this.mostrar;
  }
  copyCredentials(){
    if(this.copy == false) this.copy = true;

    this.copyText(this.objInvDetail.credenciales.correo, this.objInvDetail.credenciales.contrasena);
  }

  pagarCuota(cuota: number){
    if(this.codPerfil==='CLI') return;
    if(!this.confirm(cuota)) return;
    this.confirm(cuota).then((result) => {
      if (result) {
        const fecha = this.formatearFecha(this.date);
        this.loadingComponent.show();
        this.getInversionService.pagarCuota(this.idInversion===null?0:this.idInversion, cuota, fecha).pipe(
          // Manejamos errores de respuesta HTTP con catchError
          catchError((error) => {
            console.error('Error capturado:', error);
            this.show(Constantes.MSG_500, 'ERROR EN EL SERVIDOR'); // Mensaje para otros errores
            return of(null);
          }))
        .subscribe((resp: any)=> { 
          if(resp.codigo==Constantes.STATUS_SUCCESS_RI) {
            this.messageService.add({severity: 'success', summary: 'Pagar cuota', detail: resp.descripcion, life: 3000
            });
          }else{
            this.messageService.add({severity: 'error', summary: 'Pagar cuota', detail: 'Error al pagar cuota.', life: 3000
            })
          }
          this.getInversionesDetail();
        });
      }
    });
  }
  
  calcularCuotasPendientes(){
    const countNonNullFP = Object.keys(this.objInvDetail)
    .filter(key => key.startsWith('fp') && this.objInvDetail[key] !== null).length;
    this.nroCuotasPendientes = this.nroCuotas - countNonNullFP;
  }

  confirm(nroCuota: number): Promise<boolean> {
    this.date = new Date();
    return new Promise((resolve) => {
        this.confirmationService.confirm({
            header: 'Pagar cuota',
            message: 'Confirme la fecha de pago de la cuota número ' + nroCuota + '.',
            accept: () => {
                resolve(true);  // Resuelve la promesa con "true" si acepta
            },
            reject: () => {
                resolve(false); // Resuelve la promesa con "false" si rechaza
            }
        });
    });
}

objInvDetail: any = {
    "idInversion": 0,
    "persona": {
        "idPersona": null,
        "nombres": "",
        "apellidoPaterno": "",
        "apellidoMaterno": "",
        "celular": "",
        "direccion": ""
    },
    "monto": 0,
    "nroCuotas": 0,
    "interes": 0,
    "valorCuota": 0,
    "fechaRegistro": "",
    "fechaInicio": "",
    "fechaFin": "",
    "credenciales": {
        "correo": "",
        "contrasena": ""
    },
    "comentario": "",
    "fp1": null,
    "fp2": null,
    "fp3": null,
    "fp4": null,
    "fp5": null,
    "fp6": null,
    "fp7": null,
    "fp8": null,
    "fp9": null,
    "fp10": null,
    "fp11": null,
    "fp12": null,
    "fp13": null,
    "fp14": null,
    "fp15": null,
    "fp16": null,
    "fp17": null,
    "fp18": null,
    "fp19": null,
    "fp20": null,
    "fp21": null,
    "fp22": null,
    "fp23": null,
    "fp24": null,
    "fp25": null,
    "fp26": null,
    "fp27": null,
    "fp28": null,
    "fp29": null,
    "fp30": null
}

async copyText(correo: string, contra: string): Promise<void> {
  try {
    var nombreCompleto = this.objInvDetail.persona.nombres;
    var palabras = nombreCompleto.trim().split(' ');
    // Uso de la función
    var texto = palabras.length > 0 ? palabras[0] + ", usa estas credenciales para iniciar sesión en el sistema:\n\n" + "Correo: " + correo + "\n" + "Contraseña: " + contra : "Hola, usa estas credenciales para iniciar sesión en el sistema:\n\n" + "Correo: " + correo + "\n" + "Contraseña: " + contra;

    this.copyToClipboard(texto);
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

// Método para formatear la fecha
private formatearFecha(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
