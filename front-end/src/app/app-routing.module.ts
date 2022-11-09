import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './main-page/explore/explore.component';
import { HomeComponent } from './main-page/home/home.component';
import { UserComponent } from './main-page/user/user.component';
import { PlaylistComponent } from './main-page/playlist/playlist.component';
import { SidenavWrapperComponent } from './sidenav-wrapper/sidenav-wrapper.component';
import { AlbumComponent } from './main-page/album/album.component';
import { ArtistComponent } from './main-page/artist/artist.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/authGuard';


const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SidenavWrapperComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
      { path: 'explore', component: ExploreComponent, canActivate: [AuthGuard] },
      { path: 'user/:username', component: UserComponent, canActivate: [AuthGuard] },
      { path: 'playlist/:id', component: PlaylistComponent, canActivate: [AuthGuard] },
      { path: 'album/:id', component: AlbumComponent, canActivate: [AuthGuard] },
      { path: 'artist/:name', component: ArtistComponent, canActivate: [AuthGuard] },
    ],
  },
  {
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
