import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(public dialogRef: MatDialogRef<PhotoDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private service: PhotoService) {
    this.photo = data.photo;
    this.albumName = data.albumName;
  }

  ngOnInit(): void {
    this.fullImageStylesPlaceholder.backgroundImage = "url('" + this.photo.path.thumb + "')";
    this.fullImageStyles.backgroundImage = "url('" + this.photo.path.big + "')";
  }

  downloadImage() {
    this.service.downloadPhoto(this.photo);
  }
  deletePhoto() {
    this._isDeleting = true;
    this.service.deletePhoto(this.albumName, this.photo)
      .subscribe(response => {
        if (response.code == 200) {
          this.dialogRef.close(response);
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
  closeDialog(){
    this.dialogRef.close(false);
  }

}
export class DialogData {
  photo: Photo
  albumName: string
}
