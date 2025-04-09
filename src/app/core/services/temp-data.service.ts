import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TempDataService {
  private data: any = {};
  /* setea el dato a guarda */
  setItem(key: string, value: any): void {
    this.data[key] = value;
  }
  /* Obtiene el dato guardado */
  getItem<T>(key: string): T | null {
    return this.data[key] ?? null;
  }
  /* eliminar objeto unico */
  removeItem(key: string): void {
    delete this.data[key];
  }
  /* Elimina todo */
  clear(): void {
    this.data = {};
  }
  /* Valida si el dato existe */
  hasItem(key: string): boolean {
    return this.data.hasOwnProperty(key);
  }
}
