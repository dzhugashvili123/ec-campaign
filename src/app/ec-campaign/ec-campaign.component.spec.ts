import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcCampaignComponent } from './ec-campaign.component';

describe('EcCampaignComponent', () => {
  let component: EcCampaignComponent;
  let fixture: ComponentFixture<EcCampaignComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EcCampaignComponent]
    });
    fixture = TestBed.createComponent(EcCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
