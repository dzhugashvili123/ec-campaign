import { Component, OnInit } from '@angular/core';
import { EcCampaignService } from '../services/ec-campaign.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PartyService } from '../party.service';


@Component({
  selector: 'app-ec-campaign-app',
  templateUrl: './ec-campaign.component.html',
  styleUrls: ['./ec-campaign.component.css']
})
export class EcCampaignAppComponent implements OnInit {
  currentView: 'home' | 'upload' | 'login' | 'dropdown' | 'campaign' | 'rows' | 'table' = 'home';

  selectedFile: File | null = null;
  isUploading = false;
  uploadStatus: string | null = null;
  campaigns: any[] = [];
  selectedCampaign: string = 'Demo List';

  intervalId: any;
  startX: number | null = null;
  isDragging = false;

  csvData: any[] = [];
  selectedData: any[] = [];
  selectedList: string = '';

  currentSlide = 0;
  totalSlides = 4;
  profileDropdownOpen = false;

  isLoggedIn = false;
  username = '';
  password = '';
  loginError: string | null = null;
  showPassword = false;
  selectionError: string = '';
  lastView: string | null = null;

  constructor(
    private campaignService: EcCampaignService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    public party: PartyService
  ) { }

  ngOnInit() {
    this.startAutoSlide();
    console.log("Hello");
    this.csvData = this.campaignService.csvData;
    this.selectedData = this.campaignService.selectedData;
    this.selectedList = "Demo List";

    if (this.campaignService.lastView) {
      this.currentView = this.campaignService.lastView as any;
      this.campaignService.lastView = null; // reset
    } else {
      this.currentView = 'home';
    }

    this.isLoggedIn = this.campaignService.isLoggedIn();
    if (this.isLoggedIn) {
      this.username = this.campaignService.getUsername() || '';
    }
    // this.getUsersList();
  }

  get assetPath() {
    return `assets/${this.party.current}`;
  }


  // ===== Carousel =====
  startAutoSlide() { this.intervalId = setInterval(() => this.nextSlide(), 10000); }
  nextSlide() { this.currentSlide = (this.currentSlide + 1) % this.totalSlides; }
  prevSlide() { this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides; }
  goToSlide(i: number) { this.currentSlide = i; clearInterval(this.intervalId); this.startAutoSlide(); }

  startDrag(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    clearInterval(this.intervalId);
    this.startX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
  }

  pauseAutoSlide() { if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; } }
  resumeAutoSlide() { if (!this.intervalId) { this.startAutoSlide(); } }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || this.startX === null) return;
    const currentX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const diff = this.startX - currentX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? this.nextSlide() : this.prevSlide();
      this.endDrag();
    }
  }
  endDrag() { this.isDragging = false; this.startX = null; this.startAutoSlide(); }

  navigateToUpload() { this.currentView = 'upload'; }
  resetToHome() {
    this.currentView = 'home';
    this.selectedFile = null;
    this.uploadStatus = null;
    this.username = '';
    this.password = '';
    this.loginError = null;
  }

  resetToHomepage() {
    this.currentView = 'home';
  }

  openLink(url: string) { window.open(url, "_blank"); }

  // ===== File Upload =====
  openFileChooser(fileInput: HTMLInputElement) { fileInput.click(); }
  handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadStatus = 'Processing...';
      this.isUploading = true;
      this.uploadFile(this.selectedFile);
    }
  }

  uploadFile(file: File) {
    this.campaignService.uploadFile(file).subscribe({
      next: response => {
        this.uploadStatus = `File uploaded successfully: ${response.message}`;
        this.isUploading = false;
        this.toastr.success(`File uploaded: ${response.message}`);
      },
      error: () => {
        this.uploadStatus = 'File upload failed!';
        this.isUploading = false;
        this.toastr.error('File upload failed!');
      }
    });
  }

  handleApiCall() {
    if (!this.selectedFile) {
      this.toastr.error('Please select a CSV file first');
      return;
    }
    if (!this.selectedCampaign) {
      this.toastr.error('Please select a campaign first');
      return;
    }

    this.isUploading = true;
    this.uploadStatus = 'Processing campaign...';

    const payload = { fileName: this.selectedFile.name, campaignName: this.selectedCampaign };

    this.campaignService.processCampaign(payload).subscribe({
      next: res => {
        this.uploadStatus = res.message;
        this.isUploading = false;
        this.selectedFile = null;
        this.toastr.success(res.message);
        setTimeout(() => {
          this.uploadStatus = null;
          window.location.reload();
        }, 4000);
      },
      error: () => {
        this.uploadStatus = 'Failed to process campaign';
        this.isUploading = false;
        this.toastr.error('Failed to process campaign');
      }
    });
  }

  login() { this.currentView = 'login'; }
  toggleProfileDropdown() { this.profileDropdownOpen = !this.profileDropdownOpen; }
  togglePassword() { this.showPassword = !this.showPassword; }

  logout() {
    this.campaignService.logout();
    this.isLoggedIn = false;
    this.profileDropdownOpen = false;
    this.currentView = 'home';
    this.username = '';
    this.password = '';
    this.loginError = null;
    this.toastr.success('Logged out successfully!');
  }

  handleLogin() {
    this.campaignService.login(this.username, this.password).subscribe({
      next: res => {
        if (res.success) {
          this.isLoggedIn = true;
          this.currentView = 'home';
          this.loginError = null;
          sessionStorage.setItem('username', res.username || this.username);
          sessionStorage.setItem('isLoggedIn', 'true');
          this.username = '';
          this.password = '';
          this.toastr.success('Login successful!');

          setTimeout(() => {
            if (this.isLoggedIn) {
              this.logout();
              this.toastr.info('You have been logged out automatically due to inactivity.');
            }
          }, 300000);
        }
      },
      error: err => {
        if (err.status === 400) this.loginError = 'Username/email and password required';
        else if (err.status === 401) this.loginError = 'Invalid username/email or password';
        else this.loginError = 'Server error. Please try again later.';
        this.toastr.error(this.loginError);
      }
    });
  }


  handleListSelection() {
    if (!this.selectedList) {
      this.selectionError = 'Please select a campaign!';
      return;
    }
    this.selectionError = '';
    console.log("dfsdfsdf");

    if (this.party.current === 'bjp') {
      this.campaignService.getBjpSelectCampaigns().subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.csvData = res.data.rowData; // assuming backend returns row data					
            this.campaignService.csvData = this.csvData;
            this.currentView = 'table';
          } else {
            this.toastr.error('No campaign data found');
          }
        },
        error: (err) => this.toastr.error('Error fetching campaigns:', err)
      });
    }
    else if (this.party.current === 'tdp') {
      this.campaignService.getTdpSelectCampaigns().subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.csvData = res.data.rowData; // assuming backend returns row data					
            this.campaignService.csvData = this.csvData;
            this.currentView = 'table';
          } else {
            this.toastr.error('No campaign data found');
          }
        },
        error: (err) => this.toastr.error('Error fetching campaigns:', err)
      });
    }
    else if (this.party.current === 'adv') {
      this.campaignService.getAdvSelectCampaigns().subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.csvData = res.data.rowData; // assuming backend returns row data					
            this.campaignService.csvData = this.csvData;
            this.currentView = 'table';
          } else {
            this.toastr.error('No campaign data found');
          }
        },
        error: (err) => this.toastr.error('Error fetching campaigns:', err)
      });
    }
  }

  openFileListScreen() { this.currentView = 'dropdown'; }

  toggleSelectAll(event: any) {
    const checked = event.target.checked;
    this.selectedData = [];
    this.csvData.forEach(row => {
      row.selected = checked;
      if (checked) this.selectedData.push(row);
    });
    this.campaignService.selectedData = this.selectedData;
  }

  onCheckboxChange(event: any, row: any) {
    if (event.target.checked) {
      if (!this.selectedData.includes(row)) this.selectedData.push(row);
    } else {
      this.selectedData = this.selectedData.filter(item => item !== row);
    }
    this.campaignService.selectedData = this.selectedData;
  }

  openDetails(row: any) {
    this.router.navigate(
      [`/${this.party.current}/row-details`],
      { state: { rowData: row } }
    );
  }

  submitSelectedRows() {
    const selectedData = this.csvData.filter(row => row.selected);
    if (selectedData.length === 0) {
      this.toastr.error('Please select at least one item!');
      return;
    }
    const uniqueRows = Array.from(new Map(selectedData.map(item => [item.MobileNo, item])).values());
    const payload = { selectedRows: uniqueRows, selectedCampaign: this.selectedCampaign };
    this.campaignService.submitRows(payload).subscribe({
      next: response => {
        this.toastr.success('Selected rows submitted successfully!');
        this.selectedData = [];
        this.csvData.forEach(row => row.selected = false);
        this.currentView = 'home';
      },
      error: error => {
        this.toastr.error('Failed to submit selected rows. Please try again.');
        console.error('API error:', error);
      }
    });
  }
}