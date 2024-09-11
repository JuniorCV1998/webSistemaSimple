import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InversionDetailComponent } from './inversion-detail.component';

describe('InversionDetailComponent', () => {
  let component: InversionDetailComponent;
  let fixture: ComponentFixture<InversionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InversionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InversionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
