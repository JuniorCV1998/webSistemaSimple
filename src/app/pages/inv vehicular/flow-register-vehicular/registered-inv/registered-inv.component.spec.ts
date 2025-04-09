import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredInvComponent } from './registered-inv.component';

describe('RegisteredInvComponent', () => {
  let component: RegisteredInvComponent;
  let fixture: ComponentFixture<RegisteredInvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisteredInvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisteredInvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
