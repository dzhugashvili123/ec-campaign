import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { EcCampaignAppComponent } from './ec-campaign/ec-campaign.component';
import { RowDetailsComponent } from './row-details/row-details.component';
import { FormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PdfViewerComponent } from './ec-campaign/pdf-viewer/pdf-viewer.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    EcCampaignAppComponent,
    RowDetailsComponent,
    PdfViewerComponent
  ],
  imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		FormsModule,
		BrowserAnimationsModule,
		ToastrModule.forRoot({
			timeOut: 5000,
			positionClass: 'toast-bottom-right',
			preventDuplicates: true,
		}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
