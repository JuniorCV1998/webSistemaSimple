import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Constantes } from '../../../../core/constant/Constantes';
import { BiometricAuthService } from '../../../../core/services/auth/biometric-auth.service';
import { CuentasGuardadasService } from '../../../../core/services/auth/cuentas-guardadas.service';

@Component({
  selector: 'app-biometria-config-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToggleSwitch],
  templateUrl: './biometria-config-card.component.html',
  styleUrl: './biometria-config-card.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BiometriaConfigCardComponent implements OnInit {

  biometriaSoportada: boolean = false;
  biometriaActiva: boolean = false;
  mostrarConfirmarActivacion: boolean = false;
  passwordConfirmacion: string = '';

  private correoActivo: string | null = null;

  constructor(
    private biometricAuthService: BiometricAuthService,
    private cuentasGuardadasService: CuentasGuardadasService,
    private messageService: MessageService
  ) {
    this.correoActivo = this.cuentasGuardadasService.obtenerCuentaActiva();
  }

  ngOnInit(): void {
    this.cargarEstadoBiometria();
  }

  private async cargarEstadoBiometria(): Promise<void> {
    this.biometriaSoportada = await this.biometricAuthService.esSoportado();
    if (this.correoActivo) {
      this.biometriaActiva = await this.biometricAuthService.estaActivadaParaCuenta(this.correoActivo);
    }
  }

  /** Se dispara al mover el switch de ingreso con huella. */
  onToggleBiometria(activar: boolean): void {
    if (!this.correoActivo) return;

    if (!activar) {
      this.biometricAuthService.desactivarParaCuenta(this.correoActivo);
      this.messageService.add({ severity: 'success', summary: 'Listo', detail: 'Ingreso con huella desactivado.', life: 3000 });
      return;
    }

    // El switch queda visualmente apagado hasta confirmar la clave.
    // El setTimeout empuja la corrección a un nuevo tick: p-toggleswitch ya
    // actualizó su estado visual interno tras el click, y necesita otro
    // ciclo de detección de cambios para volver a reflejar el valor en false.
    this.mostrarConfirmarActivacion = true;
    setTimeout(() => this.biometriaActiva = false);
  }

  /** Solo se permiten dígitos: la clave siempre es un PIN numérico de 6 dígitos. */
  onPasswordConfirmacionChange(value: string): void {
    this.passwordConfirmacion = value.replace(/\D/g, '').slice(0, 6);
  }

  async confirmarActivacionBiometria(): Promise<void> {
    if (!this.correoActivo || this.passwordConfirmacion.length !== 6) return;

    const passwordSesion = sessionStorage.getItem('contrasenaSesion');
    if (!passwordSesion || this.passwordConfirmacion !== passwordSesion) {
      this.messageService.add({ severity: 'error', summary: 'Clave incorrecta', detail: 'La clave ingresada no coincide con tu contraseña actual.', life: 3000 });
      return;
    }

    const ok = await this.biometricAuthService.activarParaCuenta(this.correoActivo, this.passwordConfirmacion);
    this.passwordConfirmacion = '';
    this.mostrarConfirmarActivacion = false;
    this.biometriaActiva = ok;

    this.messageService.add(ok
      ? { severity: 'success', summary: 'Listo', detail: 'Ingreso con huella activado.', life: 3000 }
      : { severity: 'error', summary: Constantes.MSG_SERVICE_ERROR, detail: 'No se pudo activar. Inténtalo nuevamente.', life: 3000 });
  }

  cancelarActivacionBiometria(): void {
    this.passwordConfirmacion = '';
    this.mostrarConfirmarActivacion = false;
  }
}
