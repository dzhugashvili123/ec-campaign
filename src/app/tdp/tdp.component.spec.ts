import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdpComponent } from './tdp.component';

describe('TdpComponent', () => {
  let component: TdpComponent;
  let fixture: ComponentFixture<TdpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TdpComponent]
    });
    fixture = TestBed.createComponent(TdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
