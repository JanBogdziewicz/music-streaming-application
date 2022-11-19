import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidenavWrapperComponent } from './sidenav-wrapper/sidenav-wrapper.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HomeComponent } from './main-page/home/home.component';
import { ExploreComponent } from './main-page/explore/explore.component';
import { UserComponent } from './main-page/user/user.component';
import { PlaylistComponent } from './main-page/playlist/playlist.component';
import { AlbumComponent } from './main-page/album/album.component';
import { SafeUrlPipe } from './common/safe-resource-url';
import { ScrollableDirective } from './common/scrollable-directive';
import { ArtistComponent } from './main-page/artist/artist.component';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { AuthInterceptor } from './auth.interceptor';
import { AuthGuard } from './guards/authGuard';
import { EditPlaylistDialogComponent } from './main-page/playlist/edit-playlist-dialog/edit-playlist-dialog.component';
import { NgxImageCompressService } from 'ngx-image-compress';

@NgModule({
  declarations: [
    AppComponent,
    SidenavWrapperComponent,
    HomeComponent,
    ExploreComponent,
    UserComponent,
    PlaylistComponent,
    AlbumComponent,
    ScrollableDirective,
    SafeUrlPipe,
    ArtistComponent,
    RegisterComponent,
    LoginComponent,
    EditPlaylistDialogComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ScrollingModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
