import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InversionRegisteredComponent } from './inversion-registered.component';

describe('InversionRegisteredComponent', () => {
  let component: InversionRegisteredComponent;
  let fixture: ComponentFixture<InversionRegisteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InversionRegisteredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InversionRegisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
