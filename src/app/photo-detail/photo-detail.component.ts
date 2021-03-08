import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostMetaSingleResponse } from '../model/AlbumResponse';
import { Photo } from '../model/Photo';
import { PhotoService } from '../photo.service';
import { Location } from '@angular/common';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ConfirmDialogModel } from '../model/ConfirmDialogModel';
import { ToastService } from '../toast.service';
@Component({
  selector: 'app-photo-detail',
  templateUrl: './photo-detail.component.html',
  styleUrls: ['./photo-detail.component.css']
})
export class PhotoDetailComponent implements OnInit {
  photo: Photo;
  albumName: string;
  photoId: string;
  fullImageStylesPlaceholder: any = {};
  fullImageStyles: any = {};
  _showInfo: boolean = false;
  _isDeleting: boolean;
  _isEditing: boolean = false
  metaDetails: PostMetaSingleResponse

  constructor(public dialogRef: MatDialogRef<PhotoDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private service: PhotoService, private location: Location, private dialog: MatDialog, private toastService: ToastService) {
    this.photo = data.photo;
    this.albumName = data.albumName;
    this.photoId = data.photoId;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    var key = event.key || event.keyCode;

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
    if (!this.photoId) {
      this.updateBackground();
      this.loadInfo();
      this.location.go([this.albumName, this.photo.id].join('/'))
    } else {
      this.service.getPhotoById(this.albumName, (this.photoId as any)).subscribe(result => {
        this.photoId = null;
        this.metaDetails = result;
        this.updateCurrentPhoto(this.metaDetails.result.item)
      })
    }
    this.dialogRef.beforeClosed().subscribe(() => {
      this.location.go(this.albumName)
    })
  }

  updateCurrentPhoto(photo: Photo) {
    this.location.go([this.albumName, photo.id].join('/'))
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
    let confirmRef = this.dialog.open(ConfirmDialogComponent, {
      data: new ConfirmDialogModel('Confirm?', 'Are you sure you want to delete this photo?'),
    });
    confirmRef.afterClosed().subscribe(isClosed => {
      if (isClosed) {
        this._isDeleting = true;
        this.service.deletePhoto(this.albumName, this.photo)
          .subscribe(response => {
            if (response.code == 200) {
              this.dialogRef.close({ deleted: true, photo: this.photo });
              this.toastService.toast('Deleted');
            } else {
              this.toastService.toast(response.message);
            }
          }, error => {
            this.toastService.toast('Something went wrong!');
          }, () => {
            this._isDeleting = false;
          });
      }
    })


  }
  @ViewChild('container')
  containerElement: ElementRef<HTMLDivElement>
  editPhotoCard() {
    this._isEditing = true;
    setTimeout(() => {
      this.containerElement.nativeElement.scrollBy({
        top: 100000
      });
    }, 0)

  }
  infoPhotoCard() {
    this._showInfo = !this._showInfo
    this.containerElement.nativeElement.scrollBy({
      top: this.containerElement.nativeElement.scrollHeight
    });
  }
  updatePhoto() {
    this.service.update(this.albumName, this.photo.id.toString(), this.photo.name, this.photo.description, this.photo.tags, this.photo.extra)
      .subscribe(response => {
        this.toastService.toast(response.message);
      });
  }
  closeDialog() {
    this.dialogRef.close({});
  }

}
export class DialogData {
  photo: Photo
  albumName: string
  photoId: string
}
