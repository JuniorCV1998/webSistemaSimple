import { Injectable } from '@angular/core';

const KEY_CUENTAS = 'cuentasGuardadas';
const KEY_CORREO_ACTIVO = 'correo';
const MAX_CUENTAS = 3;

@Injectable({
  providedIn: 'root'
})
export class CuentasGuardadasService {

  obtenerCuentas(): string[] {
    const raw = localStorage.getItem(KEY_CUENTAS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }

    // Migración desde el esquema anterior de una sola cuenta guardada
    const correoAntiguo = localStorage.getItem(KEY_CORREO_ACTIVO);
    if (correoAntiguo) {
      const cuentas = [correoAntiguo];
      localStorage.setItem(KEY_CUENTAS, JSON.stringify(cuentas));
      return cuentas;
    }

    return [];
  }

  obtenerCuentaActiva(): string | null {
    return localStorage.getItem(KEY_CORREO_ACTIVO);
  }

  establecerCuentaActiva(correo: string): void {
    localStorage.setItem(KEY_CORREO_ACTIVO, correo);
  }

  haAlcanzadoLimite(): boolean {
    return this.obtenerCuentas().length >= MAX_CUENTAS;
  }

  guardarCuenta(correo: string): string[] {
    let cuentas = this.obtenerCuentas().filter(c => c.toLowerCase() !== correo.toLowerCase());
    cuentas.unshift(correo);
    if (cuentas.length > MAX_CUENTAS) cuentas = cuentas.slice(0, MAX_CUENTAS);

    localStorage.setItem(KEY_CUENTAS, JSON.stringify(cuentas));
    this.establecerCuentaActiva(correo);
    return cuentas;
  }

  eliminarCuenta(correo: string): string[] {
    const cuentas = this.obtenerCuentas().filter(c => c.toLowerCase() !== correo.toLowerCase());

    if (cuentas.length === 0) {
      localStorage.removeItem(KEY_CUENTAS);
      localStorage.removeItem(KEY_CORREO_ACTIVO);
    } else {
      localStorage.setItem(KEY_CUENTAS, JSON.stringify(cuentas));
      if (this.obtenerCuentaActiva()?.toLowerCase() === correo.toLowerCase()) {
        this.establecerCuentaActiva(cuentas[0]);
      }
    }

    return cuentas;
  }
}
