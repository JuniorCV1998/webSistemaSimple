import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-biometric-activation',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './biometric-activation.component.html',
  styleUrl: './biometric-activation.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BiometricActivationComponent {

  constructor(public ref: DynamicDialogRef) { }

  activar(): void {
    this.ref.close('activar');
  }

  omitir(): void {
    this.ref.close('omitir');
  }
}
