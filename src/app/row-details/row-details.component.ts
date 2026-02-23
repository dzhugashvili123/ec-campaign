import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { EcCampaignService } from 'src/app/services/ec-campaign.service';
import { ToastrService } from 'ngx-toastr';
import { PartyService } from '../party.service';

@Component({
  selector: 'app-row-details',
  templateUrl: './row-details.component.html',
  styleUrls: ['./row-details.component.css']
})
export class RowDetailsComponent implements OnInit {

  rowData: any = {};
  schema: any[] = [];
  isSaving = false;

  constructor(
    private router: Router,
    private campaignService: EcCampaignService,
    private toastr: ToastrService,
    public party: PartyService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.rowData = nav?.extras?.state?.['rowData'];
    this.schema = nav?.extras?.state?.['schema'] || [];

    // Safety: direct access / refresh
    if (!this.rowData || !this.rowData.id) {
      this.toastr.error('Invalid record');
      this.navigateBack();
    }
  }

  ngOnInit(): void { }

  private navigateBack() {
    this.router.navigate(['/' + this.party.current]);
  }

  saveChanges(form: NgForm) {
    if (!form.valid) {
      form.control.markAllAsTouched();
      return;
    }

    if (!this.rowData?.id) {
      this.toastr.error('Record ID missing');
      return;
    }

    this.isSaving = true;

    // Build dynamic payload from schema
    const payload: any = { id: this.rowData.id };
    this.schema.forEach(field => {
      payload[field.key] = this.rowData[field.key];
    });

    const currentParty = this.party.current?.toLowerCase();
    if (currentParty) {
      this.campaignService.updateUser(currentParty, payload)
        .subscribe(this.handleResponse());
    } else {
      this.toastr.error('No party specified');
      this.isSaving = false;
    }
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  handleResponse() {
    return {
      next: (res: any) => {
        this.isSaving = false;

        if (res?.success) {
          this.toastr.success('Data updated successfully');

          // Update the localized data in the service so the table reflects the change
          const idx = this.campaignService.csvData.findIndex(r => r.id === this.rowData.id);
          if (idx !== -1) {
            this.campaignService.csvData[idx] = { ...this.rowData };
          }

          this.campaignService.lastView = 'table';
          this.router.navigate(['/' + this.party.current]); // 👈 go back correctly
        } else {
          this.toastr.error(res?.message || 'Update failed');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Update error:', err);
        this.toastr.error('Server error while updating');
      }
    };
  }



  cancel() {
    this.campaignService.lastView = 'table';
    this.navigateBack();
  }
}
