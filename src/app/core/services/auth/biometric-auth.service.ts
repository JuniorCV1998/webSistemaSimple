import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric, BiometryType } from '@capgo/capacitor-native-biometric';
import type { Credentials } from '@capgo/capacitor-native-biometric';

const SERVER_PREFIX = 'com.ssimplepay.app.biometric';
const KEY_DESCARTADAS = 'biometriaDescartada';
// Solo huella dactilar: se excluye reconocimiento facial a propósito.
const TIPOS_PERMITIDOS = [BiometryType.FINGERPRINT, BiometryType.TOUCH_ID];

@Injectable({
  providedIn: 'root'
})
export class BiometricAuthService {

  async esSoportado(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const result = await NativeBiometric.isAvailable();
      return result.isAvailable && this.incluyeHuella(result.biometryType);
    } catch {
      return false;
    }
  }

  async estaActivadaParaCuenta(correo: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const result = await NativeBiometric.isCredentialsSaved({ server: this.buildServer(correo) });
      return result.isSaved;
    } catch {
      return false;
    }
  }

  fueDescartadaParaCuenta(correo: string): boolean {
    return this.obtenerDescartadas().includes(correo.toLowerCase());
  }

  marcarDescartadaParaCuenta(correo: string): void {
    const descartadas = this.obtenerDescartadas();
    const key = correo.toLowerCase();
    if (!descartadas.includes(key)) {
      descartadas.push(key);
      localStorage.setItem(KEY_DESCARTADAS, JSON.stringify(descartadas));
    }
  }

  /** Confirma con el sensor de huella y guarda las credenciales para ingresos futuros. */
  async activarParaCuenta(correo: string, contrasena: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      await NativeBiometric.verifyIdentity({
        title: 'Confirma tu identidad',
        subtitle: 'Activar inicio de sesión con huella',
        reason: 'Se usará para ingresar más rápido la próxima vez',
        allowedBiometryTypes: TIPOS_PERMITIDOS
      });
      await NativeBiometric.setCredentials({
        username: correo,
        password: contrasena,
        server: this.buildServer(correo)
      });
      return true;
    } catch {
      return false;
    }
  }

  async desactivarParaCuenta(correo: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await NativeBiometric.deleteCredentials({ server: this.buildServer(correo) });
    } catch {
      // No había credenciales guardadas para esta cuenta
    }
  }

  /** Pide la huella y, si el usuario se autentica, devuelve las credenciales guardadas. */
  async autenticarYObtenerCredenciales(correo: string): Promise<Credentials | null> {
    if (!Capacitor.isNativePlatform()) return null;
    try {
      await NativeBiometric.verifyIdentity({
        title: 'Ingresa con tu huella',
        reason: 'Confirma tu identidad para continuar',
        allowedBiometryTypes: TIPOS_PERMITIDOS
      });
      return await NativeBiometric.getCredentials({ server: this.buildServer(correo) });
    } catch {
      return null;
    }
  }

  private incluyeHuella(tipo: BiometryType): boolean {
    return tipo === BiometryType.FINGERPRINT || tipo === BiometryType.MULTIPLE || tipo === BiometryType.TOUCH_ID;
  }

  private obtenerDescartadas(): string[] {
    const raw = localStorage.getItem(KEY_DESCARTADAS);
    return raw ? JSON.parse(raw) : [];
  }

  private buildServer(correo: string): string {
    return `${SERVER_PREFIX}.${correo.toLowerCase()}`;
  }
}
