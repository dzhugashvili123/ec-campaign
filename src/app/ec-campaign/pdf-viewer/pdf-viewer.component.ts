import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EcCampaignService } from 'src/app/services/ec-campaign.service';
import { PartyService } from '../../party.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements OnInit {

  pdfUrl!: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private campaignService: EcCampaignService,
    public party: PartyService
  ) {}

  ngOnInit(): void {
    const shortId = this.route.snapshot.paramMap.get('shortId');

    if (shortId) {
      const url = this.campaignService.getPdfUrl(shortId);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      // if opened directly without ID → go back safely
      this.navigateBack();
    }
  }

  navigateBack() {
    this.router.navigate(['/' + this.party.current]);
  }
}
