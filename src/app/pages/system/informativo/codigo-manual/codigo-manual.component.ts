import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-codigo-manual',
  standalone: true,
  imports: [CommonModule, ButtonModule,MessageModule,RouterLink],
  templateUrl: './codigo-manual.component.html',
  styleUrl: './codigo-manual.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CodigoManualComponent {

}
