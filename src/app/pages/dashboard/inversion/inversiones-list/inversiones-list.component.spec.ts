import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InversionesListComponent } from './inversiones-list.component';

describe('InversionesListComponent', () => {
  let component: InversionesListComponent;
  let fixture: ComponentFixture<InversionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InversionesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InversionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
