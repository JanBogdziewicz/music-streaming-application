import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Playlist } from 'src/app/database-entities/playlist';
import { UpdatePlaylist } from 'src/app/database-entities/update_playlist';
import { PlaylistService } from 'src/app/services/playlist.service';

@Component({
  selector: 'edit-playlist-dialog',
  templateUrl: 'edit-playlist-dialog.component.html',
  styleUrls: ['./edit-playlist-dialog.component.css'],
})
export class EditPlaylistDialogComponent {
  updateForm: FormGroup;

  public playlist: Playlist;
  public playlist_cover: string;
  private cover_file: File;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditPlaylistDialogComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private playlistService: PlaylistService
  ) {}

  ngOnInit() {
    this.playlist = this.data.playlist;

    this.playlist_cover = this.data.playlist_cover;

    this.updateForm = this.formBuilder.group({
      name: [this.playlist.name],
    });
  }

  resetForm() {
    this.playlist_cover = this.data.playlist_cover;

    this.updateForm = this.formBuilder.group({
      name: [this.playlist.name],
    });
  }

  updatePlaylist() {
    const formValue = this.updateForm.value;
    const playlist: UpdatePlaylist = {
      name: formValue.name,
      cover: this.playlist.cover,
    };

    this.playlistService.updatePlaylist(this.playlist.id, playlist).subscribe({
      next: () => {
        if (this.cover_file) {
          this.playlistService
            .updatePlaylistCover(this.playlist.id, this.cover_file)
            .subscribe(() => {
              this.openSnackBar('Playlist updated', 'OK');
              this.dialogRef.close();
            });
        } else {
          this.openSnackBar('Playlist updated', 'OK');
          this.dialogRef.close();
        }
      },
      error: (err) => {
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

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['snackbar'],
    });
  }
}
