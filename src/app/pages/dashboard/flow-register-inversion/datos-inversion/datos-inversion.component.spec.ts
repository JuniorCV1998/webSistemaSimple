import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosInversionComponent } from './datos-inversion.component';

describe('DatosInversionComponent', () => {
  let component: DatosInversionComponent;
  let fixture: ComponentFixture<DatosInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosInversionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DatosInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
