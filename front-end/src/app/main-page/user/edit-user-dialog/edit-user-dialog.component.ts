import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from 'src/app/database-entities/user';
import { UpdateUser } from 'src/app/database-entities/update_user';
import { UserService } from 'src/app/services/user.service';
import { Country, getData } from 'country-list';
import { getUsernameFromToken } from 'src/app/utils/jwt';
import { Observable } from 'rxjs';

@Component({
  selector: 'edit-user-dialog',
  templateUrl: 'edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css'],
})
export class EditUserDialogComponent {
  private username: string = getUsernameFromToken();

  private user$: Observable<User>;
  private maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 12)
  );
  private avatar_file: File;

  updateForm: FormGroup;
  public hide = true;

  public user: User;
  public user_avatar: string;
  public countries: Country[] = getData();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.user$ = this.userService.getUser(this.username);
    this.user$.subscribe((res) => {
      this.user = res;
      this.updateForm = this.formBuilder.group({
        birth_date: [this.user.birth_date],
        country: [this.user.country],
      });
    });

    this.user_avatar = this.data.user_avatar;
  }

  resetForm() {
    this.user_avatar = this.data.user_avatar;

    this.updateForm = this.formBuilder.group({
      birth_date: [this.user.birth_date],
      country: [this.user.country],
    });
  }

  updateUser() {
    let new_avatar_id;
    const formValue = this.updateForm.value;

    if (new Date(formValue.birth_date).getTime() > this.maxDate.getTime()) {
      this.openSnackBar('User has to be 12 years or older', 'OK');
      return;
    }

    const user: UpdateUser = {
      birth_date: formValue.birth_date,
      country: formValue.country,
      avatar: this.user.avatar,
    };

    if (this.avatar_file) {
      new_avatar_id = this.userService.updateUserAvatar(
        this.user.username,
        this.avatar_file
      );
    }
    if (new_avatar_id) {
      new_avatar_id.subscribe((res) => {
        user.avatar = res;
        this.updateUserRequest(user);
      });
    } else {
      this.updateUserRequest(user);
    }
  }

  updateUserRequest(user: UpdateUser) {
    this.userService.updateUser(this.user.username, user).subscribe({
      next: () => {
        this.openSnackBar('User updated', 'OK');
        this.dialogRef.close();
      },
      error: (err) => {
        if (err.error.error === 'DuplicateKeyError')
          this.openSnackBar('User already exists!! Try something else.', 'OK');
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
                this.avatar_file = files![0];
                this.user_avatar = url;
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
