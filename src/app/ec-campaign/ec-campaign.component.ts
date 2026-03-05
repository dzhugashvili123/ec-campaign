import { Component, OnInit } from '@angular/core';
import { EcCampaignService } from '../services/ec-campaign.service';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PartyService } from '../party.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


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
  selectedCampaign: string = '';
  uploadedFileName: string | null = null;
  rowCount: number = 0;
  isValidated: boolean = false;

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
  currentCampaignSchema: any[] = [];
  scheduleTime: string = '';
  isScheduleOpen: boolean = false;

  showAddModal = false;
  newRecord: any = { firstName: '', MobileNo: '', email: '' };

  private destroy$ = new Subject<void>();

  constructor(
    private campaignService: EcCampaignService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public party: PartyService
  ) { }

  ngOnInit() {
    this.startAutoSlide();
    console.log("Component initialized");

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const partyCode = params['party'];
      if (partyCode) {
        console.log("Route changed, new party:", partyCode);

        // Check if we should restore state from service
        if (this.campaignService.lastView === 'table' && this.campaignService.selectedList) {
          console.log("Restoring state from service...");
          this.selectedList = this.campaignService.selectedList;
          this.selectedCampaign = this.campaignService.selectedCampaign;
          this.csvData = this.campaignService.csvData;
          this.currentCampaignSchema = this.campaignService.currentCampaignSchema;
          this.currentView = 'table';
          this.campaignService.lastView = null; // consume it
        } else {
          // Reset state to avoid data leakage
          this.currentView = 'home';
          this.selectedCampaign = '';
          this.selectedList = '';
          this.csvData = [];
          this.selectedData = [];
          this.campaigns = [];
          this.campaignService.csvData = [];
          this.campaignService.selectedData = [];
          this.campaignService.selectedList = '';
          this.campaignService.selectedCampaign = '';
          this.campaignService.currentCampaignSchema = [];
          this.uploadStatus = null;
          this.selectedFile = null;
        }

        this.handleRouteChange(partyCode);
      }
    });

    this.isLoggedIn = this.campaignService.isLoggedIn();
    if (this.isLoggedIn) {
      this.username = this.campaignService.getUsername() || '';
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.pauseAutoSlide();
  }

  handleRouteChange(partyCode: string) {
    console.log("Syncing components for:", partyCode);

    // Immediate visual sync for assets
    this.party.current = partyCode.toLowerCase();

    // Fetch full client data for theme and campaigns
    this.campaignService.getClients().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const matchingClient = res.data.find((c: any) =>
            (c.clientMeta?.code?.toLowerCase() === partyCode.toLowerCase()) ||
            (c.code?.toLowerCase() === partyCode.toLowerCase()) ||
            (c.name?.toLowerCase() === partyCode.toLowerCase())
          );

          if (matchingClient) {
            console.log("Sync success for client:", matchingClient.name);
            this.party.setClient(matchingClient);
            this.campaignService.setSelectedClientId(matchingClient.id);
            this.fetchCampaigns();
          } else {
            console.warn("No configuration found for party:", partyCode);
            this.toastr.warning(`Configuration for '${partyCode}' not found.`);
            this.campaignService.setSelectedClientId('');
            this.fetchCampaigns();
          }
        }
      },
      error: (err) => {
        console.error('Fetch clients error:', err);
        this.toastr.error('Failed to sync client data.');
        this.fetchCampaigns();
      }
    });
  }

  fetchCampaigns() {
    const clientId = this.campaignService.getSelectedClientId();
    if (clientId) {
      this.campaignService.getCampaignsBySelectedClient().subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.campaigns = response.data;
          } else {
            this.toastr.warning('No campaigns found for this client');
          }
        },
        error: (err) => {
          console.error('Error fetching campaigns:', err);
          this.toastr.error('Failed to fetch campaigns');
        }
      });
    }
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
      if (!this.selectedCampaign) {
        this.toastr.error('Please select a campaign before uploading the file.');
        input.value = ''; // Reset input
        return;
      }

      const fileName = input.files[0].name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx')) {
        this.toastr.error('Invalid file type. Please upload a .csv or .xlsx file.');
        input.value = '';
        return;
      }

      this.selectedFile = input.files[0];

      this.isUploading = true;
      this.uploadStatus = 'Uploading and validating file...';
      this.isValidated = false;
      this.rowCount = 0;

      const clientId = this.campaignService.getSelectedClientId() || '';

      this.campaignService.uploadFile(this.selectedFile, this.selectedCampaign, clientId).subscribe({
        next: (res) => {
          this.isUploading = false;

          if (res.rowCount === 0) {
            this.isValidated = false;
            this.selectedFile = null;
            this.uploadStatus = 'No records found in the file.';
            this.toastr.error('No records found in the file. Please upload a file with data.');
            return;
          }

          this.isValidated = true;
          this.uploadedFileName = res.fileName;
          this.rowCount = res.rowCount;
          this.uploadStatus = `Validated: ${res.rowCount} records.`;
          this.toastr.success(`${res.message}. Total records: ${res.rowCount}`);
        },
        error: (err) => {
          this.isUploading = false;
          this.isValidated = false;
          this.selectedFile = null;
          input.value = '';
          const errorMsg = err.error?.error || 'Validation failed';
          this.uploadStatus = errorMsg;
          this.toastr.error(errorMsg);
        }
      });
    }
  }

  handleApiCall() {
    if (!this.isValidated || !this.uploadedFileName) {
      this.toastr.error('Please upload and validate a file first.');
      return;
    }
    if (!this.selectedCampaign) {
      this.toastr.error('Please select a campaign first');
      return;
    }

    this.isUploading = true;
    this.uploadStatus = 'Inserting records into queue...';

    const clientId = this.campaignService.getSelectedClientId();
    const payload = {
      fileName: this.uploadedFileName,
      campaignName: this.selectedCampaign,
      clientId: clientId,
      scheduleTime: this.isScheduleOpen ? this.scheduleTime : null
    };

    this.campaignService.processCampaign(payload).subscribe({
      next: res => {
        this.uploadStatus = res.message;
        this.isUploading = false;
        this.isValidated = false;
        this.uploadedFileName = null;
        this.selectedFile = null;
        this.toastr.success(res.message);
        setTimeout(() => {
          this.uploadStatus = null;
          window.location.reload();
        }, 4000);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to process campaign';
        this.uploadStatus = errorMsg;
        this.isUploading = false;
        this.toastr.error(errorMsg);
        console.error('API error:', err);
      }
    });
  }

  handleDownloadSample() {
    if (!this.selectedCampaign) {
      this.toastr.error('Please select a campaign first');
      return;
    }

    this.campaignService.downloadSample(this.selectedCampaign).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.selectedCampaign}_sample.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        link.remove();
        this.toastr.success('Sample file downloaded successfully');
      },
      error: (err) => {
        console.error('Error downloading sample:', err);
        this.toastr.error('Failed to download sample file');
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

    const selectedCampaignObj = this.campaigns.find(c => c.id == this.selectedList || c.campaignname === this.selectedList);
    const campaignName = selectedCampaignObj ? selectedCampaignObj.campaignname : this.selectedList;

    // Set selected campaign for run campaign
    this.selectedCampaign = campaignName;
    this.campaignService.selectedCampaign = campaignName;
    this.campaignService.selectedList = this.selectedList;

    // Set schema
    this.currentCampaignSchema = selectedCampaignObj?.fields || [];
    this.campaignService.currentCampaignSchema = this.currentCampaignSchema;
    console.log("Current Schema:", this.currentCampaignSchema);

    // Fetch campaign data (rows) - UNIFIED from campaign_queue
    const clientId = this.campaignService.getSelectedClientId();
    if (clientId) {
      this.campaignService.getCampaignQueueRecords(this.selectedCampaign, clientId).subscribe({
        next: (res: any) => {
          if (res && res.data) {
            this.csvData = res.data.rowData;
            this.campaignService.csvData = this.csvData;
            this.currentView = 'table';
          } else {
            this.toastr.error('No campaign data found');
          }
        },
        error: (err) => {
          console.error('Error fetching campaigns:', err);
          this.toastr.error('Error fetching campaigns');
        }
      });
    } else {
      this.toastr.error('No client selected');
    }
  }

  openAddModal() {
    this.newRecord = { firstName: '', MobileNo: '', email: '' };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  addNewRecord() {
    if (!this.newRecord.firstName || !this.newRecord.MobileNo) {
      this.toastr.error('First Name and Mobile No are required!');
      return;
    }

    const record: any = {
      ...this.newRecord,
      selected: true,
      id: Date.now() // temporary ID
    };

    this.csvData.unshift(record);
    this.toastr.success('Record added successfully');
    this.closeAddModal();
  }

  openFileListScreen() {
    if (this.selectedCampaign) {
      this.selectedList = this.selectedCampaign;
      this.handleListSelection();
    } else {
      this.currentView = 'dropdown';
    }
  }
  openUploadScreen() { this.currentView = 'upload'; }

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
      { state: { rowData: row, schema: this.currentCampaignSchema } }
    );
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1') // insert a space before all caps
      .replace(/^./, (str) => str.toUpperCase()) // capitalize the first letter
      .replace(/_/g, ' ') // replace underscores with spaces
      .trim();
  }

  submitSelectedRows() {
    const selectedData = this.csvData.filter(row => row.selected);
    if (selectedData.length === 0) {
      this.toastr.error('Please select at least one item!');
      return;
    }
    const uniqueRows = Array.from(new Map(selectedData.map(item => [item.id || item.MobileNo, item])).values());
    const payload = {
      selectedRows: uniqueRows,
      selectedCampaign: this.selectedCampaign,
      clientId: this.campaignService.getSelectedClientId(),
      scheduleTime: this.isScheduleOpen ? this.scheduleTime : null
    };
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

  viewReports() {
    const partName = this.party.current;
    this.router.navigate([`/reports/`], { queryParams: { name: partName } });
  }
}