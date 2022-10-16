import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoComponent } from './demo/demo.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidenavWrapperComponent } from './sidenav-wrapper/sidenav-wrapper.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { HomeComponent } from './main-page/home/home.component';
import { ExploreComponent } from './main-page/explore/explore.component';
import { UserComponent } from './main-page/user/user.component';

@NgModule({
  declarations: [AppComponent, DemoComponent, SidenavWrapperComponent, HomeComponent, ExploreComponent, UserComponent],
  imports: [
    CommonModule,
    MaterialModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
