import { Component } from '@angular/core';
import { routes } from '../../../../app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-datos-inversion',
  standalone: true,
  imports: [],
  templateUrl: './datos-inversion.component.html',
  styleUrl: './datos-inversion.component.scss'
})
export default class DatosInversionComponent {

  constructor(private router: Router){}

}
