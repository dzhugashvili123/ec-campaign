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
  isSaving = false;

  constructor(
    private router: Router,
    private campaignService: EcCampaignService,
    private toastr: ToastrService,
    public party: PartyService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.rowData = nav?.extras?.state?.['rowData'];

    // Safety: direct access / refresh
    if (!this.rowData || !this.rowData.id) {
      this.toastr.error('Invalid record');
      this.navigateBack();
    }
  }

  ngOnInit(): void { }

  private navigateBack() {
    // 👈 Go back to the correct party page (/bjp or /tdp)
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

    // Shared fields sent for BOTH parties
    let payload: any = {
      id: this.rowData.id,
      firstName: this.rowData.firstName,
      lastName: this.rowData.lastName,
      MobileNo: this.rowData.MobileNo,
      email: this.rowData.email,
      city: this.rowData.city,
      state: this.rowData.state,
      zip: this.rowData.zip,
      ConstituencyName: this.rowData.ConstituencyName,
      PartyName: this.rowData.PartyName,
      text1link: this.rowData.text1link,
      selectLanguage: this.rowData.selectLanguage
    };

    // ================= BJP SUBMISSION =================
    if (this.party.current === 'bjp') {
      payload = {
        ...payload,
        AtalPensionYojana: this.rowData.AtalPensionYojana,
        APY_Amount: this.rowData.APY_Amount,
        APY_Date: this.rowData.APY_Date,

        PMKSN: this.rowData.PMKSN,
        PMKSN_Amount: this.rowData.PMKSN_Amount,
        PMKSN_Date: this.rowData.PMKSN_Date,

        PMGAY: this.rowData.PMGAY,
        PMGAY_Amount: this.rowData.PMGAY_Amount,
        PMGAY_Date: this.rowData.PMGAY_Date,
      };

      this.campaignService.updateBjpUser(payload)
        .subscribe(this.handleResponse());
    }
    else if (this.party.current === 'tdp') {
      payload = {
        ...payload,
        ThallikiVandhanam: this.rowData.ThallikiVandhanam,
        ThallikiVandhanam_Amount: this.rowData.ThallikiVandhanam_Amount,
        ThallikiVandhanam_Date: this.rowData.ThallikiVandhanam_Date,

        AnnaDhaatha: this.rowData.AnnaDhaatha,
        AnnaDhaatha_Amount: this.rowData.AnnaDhaatha_Amount,
        AnnaDhaatha_Date: this.rowData.AnnaDhaatha_Date,

        MahaShakti: this.rowData.MahaShakti,
        MahaShakti_Amount: this.rowData.MahaShakti_Amount,
        MahaShakti_Date: this.rowData.MahaShakti_Date
      };

      this.campaignService.updateTdpUser(payload)
        .subscribe(this.handleResponse());
    }

    // ================= TDP SUBMISSION =================
    else {
      payload = {
        ...payload,
        ThallikiVandhanam: this.rowData.ThallikiVandhanam,
        ThallikiVandhanam_Amount: this.rowData.ThallikiVandhanam_Amount,
        ThallikiVandhanam_Date: this.rowData.ThallikiVandhanam_Date,

        AnnaDhaatha: this.rowData.AnnaDhaatha,
        AnnaDhaatha_Amount: this.rowData.AnnaDhaatha_Amount,
        AnnaDhaatha_Date: this.rowData.AnnaDhaatha_Date,

        MahaShakti: this.rowData.MahaShakti,
        MahaShakti_Amount: this.rowData.MahaShakti_Amount,
        MahaShakti_Date: this.rowData.MahaShakti_Date
      };

      this.campaignService.updateTdpUser(payload)
        .subscribe(this.handleResponse());
    }
  }

  handleResponse() {
    return {
      next: (res: any) => {
        this.isSaving = false;

        if (res?.success) {
          this.toastr.success('Data updated successfully');
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
