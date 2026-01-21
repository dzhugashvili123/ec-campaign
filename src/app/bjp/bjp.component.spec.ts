import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BjpComponent } from './bjp.component';

describe('BjpComponent', () => {
  let component: BjpComponent;
  let fixture: ComponentFixture<BjpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BjpComponent]
    });
    fixture = TestBed.createComponent(BjpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
