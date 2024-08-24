import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInversionComponent } from './confirm-inversion.component';

describe('ConfirmInversionComponent', () => {
  let component: ConfirmInversionComponent;
  let fixture: ComponentFixture<ConfirmInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmInversionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
