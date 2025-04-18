import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TempDataService {
  private data: any = {};
  private constantData: any = {};

  // Set temporal
  setItem(key: string, value: any): void {
    this.data[key] = value;
  }

  // Get temporal
  getItem<T>(key: string): T | null {
    return this.data[key] ?? null;
  }

  // Set constante
  setConstant(key: string, value: any): void {
    this.constantData[key] = value;
  }

  // Get constante
  getConstant<T>(key: string): T | null {
    return this.constantData[key] ?? null;
  }

  // Remove temporal
  removeItem(key: string): void {
    delete this.data[key];
  }

  // Remove constante
  removeConstant(key: string): void {
    delete this.constantData[key];
  }

  // Clear solo temporal
  clear(): void {
    this.data = {};
  }

  // Valida si existe en temporal
  hasItem(key: string): boolean {
    return this.data.hasOwnProperty(key);
  }

  // Valida si existe en constante
  hasConstant(key: string): boolean {
    return this.constantData.hasOwnProperty(key);
  }
}
