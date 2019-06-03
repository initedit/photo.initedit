import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';

import { NgMasonryGridModule } from 'ng-masonry-grid';
import { NgxMasonryModule } from 'ngx-masonry';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from './/app-routing.module';
import { GallaryComponent } from './gallary/gallary.component';
import { PasswordComponent } from './password/password.component';
import { PhotoCardComponent } from './photo-card/photo-card.component';
import { UploadButtonComponent } from './upload-button/upload-button.component';
import { LoadingComponent } from './loading/loading.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GallaryComponent,
    PasswordComponent,
    PhotoCardComponent,
    UploadButtonComponent,
    LoadingComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgMasonryGridModule,
    NgxMasonryModule,
    InfiniteScrollModule,
    AngularFontAwesomeModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
