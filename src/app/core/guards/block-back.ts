import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { MaintenanceSocketService } from '../services/mantenimiento/maintenance-socket.service';

export interface BlockBack {
  blockBackNavigation: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BlockBackGuard implements CanDeactivate<BlockBack> {

  constructor(private maintenanceSocketService: MaintenanceSocketService) {}

  canDeactivate(component: BlockBack): boolean {

    // Si el WebSocket forzó navegación, dejar salir SIEMPRE
    if (this.maintenanceSocketService.ignoreBackBlock) {
      this.maintenanceSocketService.ignoreBackBlock = false; // Reset
      return true;
    }

    // Comportamiento normal
    return !component.blockBackNavigation;
  }
}