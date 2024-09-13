import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import confetti from 'canvas-confetti';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-inversion-registered',
  standalone: true,
  imports: [ButtonModule,CommonModule,ToastModule,TabMenuModule],
  templateUrl: './inversion-registered.component.html',
  styleUrl: './inversion-registered.component.scss'
})
export default class InversionRegisteredComponent {

  constructor(
    private messageService: MessageService,
    private router: Router
  ){}

  //Mostrar clave usuario
  mostrar: boolean = false;
  copy: boolean = false;

  objInversion: any = {
    "idInversion": 30,
    "monto": 5000.0,
    "nombres": "Jose Octavio",
    "apellidoPaterno": "Cerron",
    "apellidoMaterno": "Vicente",
    "correo": "wuanyilo43@ssimple.com",
    "contrasenaClient": "43wuany070",
    "fechaCreacion": "07 de sept. 2024 - 10:48 a. m.",
    "codOperacion": "000000030"
};

  ngOnInit(){
    this.triggerConfetti();
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
