import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { BiometriaConfigCardComponent } from '../../shared/biometria-config-card/biometria-config-card.component';

@Component({
  selector: 'app-configuracion-cliente',
  standalone: true,
  imports: [CommonModule, ToastModule, BiometriaConfigCardComponent],
  providers: [ConfirmationService, MessageService],
  templateUrl: './configuracion-cliente.component.html',
  styleUrl: './configuracion-cliente.component.scss'
})
export default class ConfiguracionClienteComponent { }
