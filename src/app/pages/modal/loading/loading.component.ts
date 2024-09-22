import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {

  isVisible = false;  // Estado para controlar si el loading está visible

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

}
