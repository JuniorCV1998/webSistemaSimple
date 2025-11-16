import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { appsettings } from '../../appsettings';
import { Router } from '@angular/router';

import SockJS from 'sockjs-client';
import { LoginService } from '../auth/login/login.service';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MaintenanceSocketService {

  public isMaintenance$ = new BehaviorSubject<boolean>(false);
  public ignoreBackBlock = false;

  private stompClient!: Client;
  codPerfil: string = '';

  constructor(private router: Router, private loginService: LoginService) {
    this.initializeWebSocketConnection();
    const decodedToken = this.loginService.getDecodedToken();
    if (decodedToken) {
      this.codPerfil = decodedToken.codPerfil;
    }
  }

  initializeWebSocketConnection() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(appsettings.API_SERVER + 'ws'),
      reconnectDelay: 5000
    });

    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/maintenance', (msg: IMessage) => {
        const isMaintenance = msg.body === 'true';

        // Estado global
        this.isMaintenance$.next(isMaintenance);

        if (isMaintenance) {
          if (this.codPerfil !== 'ADM') this.router.navigate(['/mantenimiento']);
        } else {
          this.ignoreBackBlock = true;
          if (this.codPerfil !== 'ADM') this.router.navigate(['/inicio']);
        }
      });
    };

    this.stompClient.activate();
  }

}
