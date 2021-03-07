import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlbumInfoResponse } from '../model/AlbumResponse';
import { Photo } from '../model/Photo';
import { PhotoDetailComponent } from '../photo-detail/photo-detail.component';
import { PhotoService } from '../photo.service';


@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.css']
})
export class PhotoCardComponent implements OnInit {
  @Input() photo: Photo;
  @Input() albumName: string;
  @Output() OnDeleted = new EventEmitter<Photo>();
  currentStyles = {
    backgroundImage: "",
    height: "",
  };
  fullImageStyles = {
    backgroundImage: ""
  }
  _perRow = 1;
  _fullscreen: boolean = false
  _isEditing: boolean = false
  fullImageStylesPlaceholder: any = {};
  editMessage: string;
  _showInfo: boolean = false;
  _isDeleting: boolean;


  constructor(private service: PhotoService, public dialog: MatDialog) { }

  ngOnInit() {
    this.setup();
    let ratio = this.photo.height / this.photo.width;
    let w = (window.screen.availWidth - (10 * this._perRow)) / this._perRow;
    let h = w * ratio;

    this.currentStyles.backgroundImage = "url('" + this.photo.path.thumb + "')";
    this.currentStyles.height = h + "px";

  }

  setup() {
    let w = window.screen.availWidth;
    if (w > 1024) {
      this._perRow = 4;
    } else if (w > 720) {
      this._perRow = 2;
    } else {
      this._perRow = 1;
    }
  }
  showFullImage() {
    const dialogRef = this.dialog.open(PhotoDetailComponent, {
      data: {
        photo: this.photo,
        albumName: this.albumName,
      },
      width:'100%',
      height:'100%',
      panelClass:'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result:PhotoDetailCloseData) => {
      if (result) {
        if(result.deleted){
          this.OnDeleted.emit(result.photo)
        }
      }
    });
  }
  downloadImage() {
    this.service.downloadPhoto(this.photo);
  }

}
export class PhotoDetailCloseData{
  deleted:boolean;
  photo:Photo;
}
