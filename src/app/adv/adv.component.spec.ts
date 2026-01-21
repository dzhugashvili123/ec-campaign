import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvComponent } from './adv.component';

describe('AdvComponent', () => {
  let component: AdvComponent;
  let fixture: ComponentFixture<AdvComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvComponent]
    });
    fixture = TestBed.createComponent(AdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
