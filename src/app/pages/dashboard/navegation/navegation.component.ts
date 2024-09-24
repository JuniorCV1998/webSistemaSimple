import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navegation',
  standalone: true,
  imports: [RouterOutlet,CommonModule],
  templateUrl: './navegation.component.html',
  styleUrl: './navegation.component.scss'
})
export class NavegationComponent {

  showVolverButton: boolean = true;
  showIconHome: boolean = false;
  showAux: boolean = false;

  irInicio: boolean = false;

  private routerSubscription!: Subscription;

  constructor(
    private location: Location,
    private router: Router
  ){}

  ngOnInit() {
    const inicio = [
      '/inicio'
    ];
    const sinInicio = [
      '/registrar/inversiondetalle'
    ];
    const irInicio = [
      '/inversion/cartilla'
    ];

    // Suscribirse a los eventos de navegación para detectar cambios de ruta
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.url.split('?')[0]; // Para ignorar parámetros de query

        // Controlar la visibilidad del botón "Volver" en función de la ruta actual
        if (inicio.includes(currentRoute)) {
          this.showVolverButton = false;
          this.showAux = false;
          /* this.showIconHome = true; */
        } else if(sinInicio.includes(currentRoute)){
          this.showVolverButton = false;
          this.showAux = true;
        }else if(irInicio.includes(currentRoute)){
          this.showVolverButton = true;
          this.irInicio = true;
        } else {
          this.showVolverButton = true;
          this.irInicio = false;
          this.showAux = false;
          /* this.showIconHome = false; */
        }
      }
    });
  }

  ngOnDestroy() {
    // Limpiar la suscripción cuando el componente se destruya para evitar fugas de memoria
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  volver() {
    if(this.irInicio) this.router.navigate(['/inicio']);
    else this.location.back();
}

}
