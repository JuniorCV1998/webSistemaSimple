import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavegationComponent } from './pages/nav/navegation/navegation.component';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavegationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'WebSistemaSimple';

  ngOnInit() {
    // Habilita el desplazamiento automático cuando el teclado aparece
    Keyboard.setScroll({ isDisabled: false });
  }

}
