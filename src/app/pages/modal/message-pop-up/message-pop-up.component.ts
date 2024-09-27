import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-message-pop-up',
  standalone: true,
  imports: [ButtonModule],
  providers: [],
  templateUrl: './message-pop-up.component.html',
  styleUrl: './message-pop-up.component.scss'
})
export class MessagePopUpComponent {

  message: string = '';

  constructor(
    public ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ){
    this.message = config.data.message;
  }

  close() {
    this.ref.close('aceptar');
  }

}
