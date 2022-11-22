import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PlaylistService } from 'src/app/services/playlist.service';
import { AddPlaylist } from 'src/app/database-entities/add_playlist';
import { getUsernameFromToken } from 'src/app/utils/jwt';

@Component({
  selector: 'add-playlist-dialog',
  templateUrl: 'add-playlist-dialog.component.html',
  styleUrls: ['./add-playlist-dialog.component.css'],
})
export class AddPlaylistDialogComponent {
  private username: string = getUsernameFromToken();

  addForm: FormGroup;

  private cover_file: File;

  public default_playlist_cover: string;
  public playlist_cover: string;
  public playlist_cover_id: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddPlaylistDialogComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.playlistService
      .getDefaultPlaylistCoverId()
      .subscribe((res) => (this.playlist_cover_id = res));

    this.getDefaultPlaylistCover();

    this.addForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  resetForm() {
    this.playlist_cover = this.default_playlist_cover;

    this.addForm = this.formBuilder.group({
      name: ['', Validators.required],
    });
  }

  createUrl(image: Observable<Blob>) {
    image.subscribe((data) => {
      let url = URL.createObjectURL(data);
      this.default_playlist_cover = url;
      this.playlist_cover = url;
    });
  }

  getDefaultPlaylistCover() {
    let image = this.playlistService.getDefaultPlaylistCover();
    this.createUrl(image);
  }

  addPlaylist() {
    const formValue = this.addForm.value;

    const playlist: AddPlaylist = {
      name: formValue.name,
      user: this.username,
      cover: this.playlist_cover_id,
    };

    if (!playlist.name.length) {
      this.openSnackBar(
        'Please provide playlist name to create a new playlist',
        'OK'
      );
      return;
    }

    this.playlistService.addPlaylist(playlist).subscribe({
      next: (res) => {
        if (this.cover_file) {
          this.playlistService
            .updatePlaylistCover(res.id, this.cover_file)
            .subscribe(() => {
              this.openSnackBar('Playlist added', 'OK');
              this.dialogRef.close();
            });
        } else {
          this.openSnackBar('Playlist added', 'OK');
          this.dialogRef.close();
        }
      },
      error: (err) => {
        console.log(err);
        if (err.error.error === 'DuplicateKeyError')
          this.openSnackBar(
            'Playlist with such name already exists in your library! Try something else.',
            'OK'
          );
        else this.openSnackBar('Something went wrong!!', 'OK');
      },
    });
  }

  onFileSelected(e: Event) {
    let event = e.target as HTMLInputElement;
    let files = event.files;

    let extension = event.value.split('.').pop();
    if (extension) {
      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png': {
          if (files && files[0]) {
            if (files[0].size > 500000) {
              this.openSnackBar(
                'Unable to upload. File too big (max 500kb)',
                'OK'
              );
              return;
            }
            let img = new Image();
            let url = URL.createObjectURL(files[0]);
            img.src = url;
            img.onload = () => {
              let ratio = img.width / img.height;
              if (ratio > 2 || ratio < 0.5) {
                URL.revokeObjectURL(url);
                this.openSnackBar(
                  'Unable to upload. Ratio of the image should be between 2 and 0.5',
                  'OK'
                );
              } else {
                this.cover_file = files![0];
                this.playlist_cover = url;
                this.openSnackBar('Image uploaded', 'OK');
              }
            };
          }
          break;
        }
        default: {
          this.openSnackBar(
            'Invalid file type (jpg, jpeg and png supported)',
            'OK'
          );
          break;
        }
      }
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }
}
