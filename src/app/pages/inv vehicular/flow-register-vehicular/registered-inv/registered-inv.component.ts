import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';
import { catchError, finalize, of } from 'rxjs';
import { Constantes } from '../../../../core/constant/Constantes';
import { InversionVehService } from '../../../../core/services/inversion-veh/inversion-veh.service';
import { LoadingComponent } from '../../../modal/loading/loading.component';
import { MessagePopUpComponent } from '../../../modal/message-pop-up/message-pop-up.component';

@Component({
  selector: 'app-registered-inv',
  standalone: true,
  imports: [LoadingComponent, LoadingComponent, CommonModule, TabMenuModule, ButtonModule],
  templateUrl: './registered-inv.component.html',
  styleUrl: './registered-inv.component.scss'
})
export default class RegisteredInvComponent {

  @ViewChild(LoadingComponent) loadingComponent!: LoadingComponent;

  idInversionVehicular: number | null = null;
  confetti: boolean = false;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private inversionVehService: InversionVehService,
    private dialogService: DialogService,
    private router: Router
  ){
    const obj = sessionStorage.getItem('confetti');
    if(obj) {
      this.confetti = JSON.parse(obj);
    }
  }

  objInversionVeh: any = {
    idInversionVeh: 0,
    fullName: "",
    descripcion: "",
    fechaCreacion: ""
};

  ngOnInit(): void{
    // Recuperar el parámetro de consulta `idInversion`
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('idInversionVeh');
      this.idInversionVehicular = id ? +id : null; // Convertir a número si existe
    });

    /* this.getInversionVehicularRegistered(); */
    setTimeout(() => {
          this.loadingComponent.show();
          this.getInversionVehicularRegistered();
        },); 
      
  }

  ngAfterViewInit(): void{

  }

    getInversionVehicularRegistered(){
      this.inversionVehService.getInversionVehRegistered(this.idInversionVehicular===null?0:this.idInversionVehicular).pipe(
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
        if(resp == null) {
          this.show(Constantes.MSG_404, Constantes.MSG_H_404);
        } else{
          this.objInversionVeh = resp;
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

    triggerConfetti() {
      if(!this.confetti) return;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 },
        colors: ['#14b8a6', '#3b82f6']
      });
    }

}
