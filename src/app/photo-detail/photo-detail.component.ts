import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostMetaSingleResponse } from '../model/AlbumResponse';
import { Photo } from '../model/Photo';
import { PhotoService } from '../photo.service';

@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.css']
})
export class PhotoDetailComponent implements OnInit {
  photo: Photo;
  albumName: string;
  fullImageStylesPlaceholder: any = {};
  fullImageStyles: any = {};
  editMessage: string;
  _showInfo: boolean = false;
  _isDeleting: boolean;
  _isEditing: boolean = false
  metaDetails: PostMetaSingleResponse

  constructor(public dialogRef: MatDialogRef<PhotoDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private service: PhotoService) {
    this.photo = data.photo;
    this.albumName = data.albumName;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    var key = event.key || event.keyCode;
    console.log(event, key)

    if (key === 39 || key === 'ArrowRight') {
      if (this.metaDetails) {
        if (this.metaDetails.result.previous) {
          this.updateCurrentPhoto(this.metaDetails.result.previous);
        }
      }
    }

    if (key === 37 || key === 'ArrowLeft') {
      if (this.metaDetails) {
        if (this.metaDetails.result.next) {
          this.updateCurrentPhoto(this.metaDetails.result.next);
        }
      }
    }
  }

  ngOnInit(): void {
    this.updateBackground();
    this.loadInfo();
  }

  updateCurrentPhoto(photo: Photo) {
    console.log(photo);

    this.photo = photo;
    this.updateBackground();
    this.loadInfo();
  }

  updateBackground() {
    this.fullImageStylesPlaceholder.backgroundImage = "url('" + this.photo.path.thumb + "')";
    this.fullImageStyles.backgroundImage = "url('" + this.photo.path.big + "')";
  }

  loadInfo() {
    this.service.getPhotoById(this.albumName, this.photo.id).subscribe(result => {
      this.metaDetails = result;
    })
  }

  downloadImage() {
    this.service.downloadPhoto(this.photo);
  }
  deletePhoto() {
    this._isDeleting = true;
    this.service.deletePhoto(this.albumName, this.photo)
      .subscribe(response => {
        if (response.code == 200) {
          this.dialogRef.close({ deleted: true, photo: this.photo });
        }
      }, error => {
        console.log(error);
      }, () => {
        this._isDeleting = false;
      });
  }
  editPhotoCard() {
    this._isEditing = true;
  }
  updatePhoto() {
    this.service.update(this.albumName, this.photo.id.toString(), this.photo.name, this.photo.description, this.photo.tags, this.photo.extra)
      .subscribe(response => {
        if (response.code == 200) {

        }
        this.editMessage = response.message;
      });
  }
  closeDialog() {
    this.dialogRef.close({});
  }

}
export class DialogData {
  photo: Photo
  albumName: string
}
