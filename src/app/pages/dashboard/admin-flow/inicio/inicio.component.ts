import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { LoadingComponent } from '../../../modal/loading/loading.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [TabMenuModule,CommonModule,TableModule,LoadingComponent,SkeletonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {

}
