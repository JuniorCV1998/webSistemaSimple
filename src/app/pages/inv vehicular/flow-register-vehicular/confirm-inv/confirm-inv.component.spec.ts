import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmInvComponent } from './confirm-inv.component';

describe('ConfirmInvComponent', () => {
  let component: ConfirmInvComponent;
  let fixture: ComponentFixture<ConfirmInvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmInvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmInvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
