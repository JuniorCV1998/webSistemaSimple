import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { BlockBack } from '../../../../core/guards/block-back';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule, ButtonModule,MessageModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MantenimientoComponent implements BlockBack {

  blockBackNavigation = true;

}
