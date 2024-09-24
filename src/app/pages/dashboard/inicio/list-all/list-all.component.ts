import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { Location } from '@angular/common';

@Component({
  selector: 'app-list-all',
  standalone: true,
  imports: [SkeletonModule,CommonModule],
  templateUrl: './list-all.component.html',
  styleUrl: './list-all.component.scss'
})
export default class ListAllComponent {

  forSkeleton: number = 5;
  skeletonShow: boolean = true;
  ultimasInversiones: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['lista']) {
        this.skeletonShow = false;
        this.ultimasInversiones = JSON.parse(params['lista']);
        console.log(this.ultimasInversiones);
      }
    });
  }

  volver() {
    this.location.back();
}

}
