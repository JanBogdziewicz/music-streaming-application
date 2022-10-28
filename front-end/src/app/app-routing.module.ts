import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExploreComponent } from './main-page/explore/explore.component';
import { HomeComponent } from './main-page/home/home.component';
import { UserComponent } from './main-page/user/user.component';
import { PlaylistComponent } from './main-page/playlist/playlist.component';
import { SidenavWrapperComponent } from './sidenav-wrapper/sidenav-wrapper.component';
import { AlbumComponent } from './main-page/album/album.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SidenavWrapperComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'explore', component: ExploreComponent },
      { path: 'user', component: UserComponent },
      { path: 'playlist/:id', component: PlaylistComponent },
      { path: 'album/:id', component: AlbumComponent }
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
