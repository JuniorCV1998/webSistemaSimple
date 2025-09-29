import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { Location } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { FormatNumberPipe } from '../../../../core/pipes/format-number.pipe';

@Component({
  selector: 'app-list-all',
  standalone: true,
  imports: [SkeletonModule,CommonModule,TabMenuModule,RouterModule,FormatNumberPipe],
  templateUrl: './list-all.component.html',
  styleUrl: './list-all.component.scss'
})
export default class ListAllComponent {

  forSkeleton: number = 5;
  skeletonShow: boolean = true;
  ultimasInversiones: any[] = [];

  constructor(
    private location: Location
  ){}

  ngOnInit(): void {

    this.getListAllInvSession();
  }

  getListAllInvSession(){
    const list = sessionStorage.getItem('listallinv');
    if(list) {
      this.skeletonShow = false;
      this.ultimasInversiones = JSON.parse(list);
    }
  }

  volver() {
    this.location.back();
}

}
