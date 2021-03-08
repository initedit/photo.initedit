import { Component, OnInit, ChangeDetectorRef, ViewChild, HostListener, ComponentFactoryResolver } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../photo.service';
import { Photo } from '../model/Photo';
import { UploadButtonComponent } from '../upload-button/upload-button.component';
import { AppComponent } from '../app.component';
import { PhotoBaseResponse } from '../model/PhotoBaseResponse';
import { NgxMasonryComponent, NgxMasonryOptions } from 'ngx-masonry';
import { AlbumInfoResponse } from '../model/AlbumResponse';
import { PasswordComponent } from '../password/password.component';
import { MatDialog } from '@angular/material/dialog';
import { PhotoDetailComponent } from '../photo-detail/photo-detail.component';

@Component({
  selector: 'app-gallary',
  templateUrl: './gallary.component.html',
  styleUrls: [
    './gallary.component.css',
  ]
})
export class GallaryComponent implements OnInit {
  name: string;
  // showPasswordScreen: boolean = false;
  photos: Photo[] = [];
  isEmpty: boolean = false;
  _page: number = 1;
  _loading: boolean = false;
  _isAllPhotoLoaded: boolean = false;
  photoResponse: PhotoBaseResponse;
  isLocked: boolean = false;
  canEdit: boolean = false;
  isCreated: boolean = false;
  albumInfo: AlbumInfoResponse;

  dropzoneHovered: boolean = false;
  @ViewChild(UploadButtonComponent)
  private uploadButtonComponent: UploadButtonComponent;

  isError: boolean = false;
  errorMessage: any;
  @ViewChild(NgxMasonryComponent)
  private masonry: NgxMasonryComponent;

  ngxMasonaryOption: NgxMasonryOptions = {
    // transitionDuration: '0.0s',
    gutter: 10,
    horizontalOrder: true,
    percentPosition: true,
    columnWidth: '.grid-sizer',
    itemSelector: '.grid-item',
    resize: true,
    // fitWidth:true,
  };

  constructor(private route: ActivatedRoute, private photoService: PhotoService, public dialog: MatDialog) { }

  ngOnInit() {
    this.name = this.route.snapshot.paramMap.get('name');
    let photoId = this.route.snapshot.paramMap.get('id');
    if (photoId) {
      this.showFullImage(photoId);
    } else {
      this.loadAlbumInfo(true);
    }
  }
  @HostListener("document:paste", ["$event"])
  onPasteContent(event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
      var item = items[index];
      if (item.kind === 'file') {
        var blob = item.getAsFile();
        this.uploadButtonComponent.addFilesForUpload([blob]);
      }
    }
  }
  showFullImage(photoId) {
    const dialogRef = this.dialog.open(PhotoDetailComponent, {
      data: {
        photoId: photoId,
        albumName: this.name,
      },
      width: '100%',
      height: '100%',
      panelClass: 'full-width-dialog'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.deleted) {
          this.OnPhotoDeleted(result.photo)
        }
      }
      if (this.photos.length == 0) {
        this.loadAlbumInfo(true);
      }
    });
  }

  loadAlbumInfo(shouldRefresh: boolean) {
    this.photoService.info(this.name)
      .subscribe(info => {
        this.albumInfo = info;
        this.calculateFlags();
        //Handle 404
        if (shouldRefresh) {
          this.refreshFeed();
        }
      });
  }

  calculateFlags() {
    //TODO:: Show Password Dialog if Note is Private;
    if (this.albumInfo.type) {
      let albumType = this.albumInfo.type.toLowerCase();
      this.isLocked = albumType == 'public' ? false : true;
      this.canEdit = this.isLocked == true ? (this.name == this.photoService.getActiveAlbum()) : true;
      if (this.canEdit == false && albumType == 'private') {
        //TODO:: Show Password Dialog
      }
      if (this.albumInfo.code == 404) {
        this.isCreated = false;
      } else {
        this.isCreated = true;
      }
    }
    console.log(this.albumInfo, this.isCreated, this.canEdit, this.isLocked);

  }

  refreshFeed() {
    this._page = 1;
    this.photos.length = 0;
    this.load();
  }

  handleLocking() {
    if (this.photoResponse) {
      //TODO:: Check when to show Password Dialog
      this.openPasswordDialog();
    }
  }

  openPasswordDialog() {
    let passwordDialog = this.dialog.open(PasswordComponent, {
      data: {
        albumName: this.name,
        albumInfo: this.albumInfo,
      },
      position: {
        top: '20px'
      },
      minWidth: 300
    });

    passwordDialog.afterClosed().subscribe(isLoggedIn => {
      //TODO:: Logged in user(Refresh Screen or do something)
      if (isLoggedIn) {
        this._isAllPhotoLoaded = false;
        this.calculateFlags();
        this.refreshFeed();
      }
    })
  }

  load() {

    document.title = this.name + " - " + AppComponent.title;
    this._loading = true;
    this.photoService.getPhoto(this.name, this._page)
      .subscribe((photoResponse: PhotoBaseResponse) => {
        this.isError = false;
        this.photoResponse = photoResponse;
        if (photoResponse.code == 401) {
          this.openPasswordDialog();
        } else if (photoResponse.code == 404) {

        } else {
          this.photos = this.photos.concat(photoResponse.result);

          if (photoResponse.total <= this.photos.length) {
            this._isAllPhotoLoaded = true;
          }
        }
        if (!this.photos || this.photos.length === 0)
          this.isEmpty = true;
        else
          this.isEmpty = false;
        this._loading = false;
      },
        error => {
          this._loading = false;
          this.isError = true;
          this.errorMessage = error.message;
        });
  }

  lockCurrentAlbum() {
    this.photoService.removeActiveToken();
    this.calculateFlags();
    if (this.albumInfo && this.albumInfo.type == 'Private') {
      this.photos = [];
      this.masonry.reloadItems();
      this.openPasswordDialog();
    }
  }

  onPasswordClosed(isClosed: boolean) {
    this.loadAlbumInfo(false);
  }
  uploadUpdate(result: Photo) {
    if (result) {
      result.prepend = true;
      this.photos.unshift(result);
      this.masonry.layout();
      if (this.isEmpty)
        this.refreshFeed();
    }
  }
  removeItem(evnt: any) {

  }
  onScroll() {
    if (this._isAllPhotoLoaded)
      return;

    this._page++;
    this.load();
  }
  OnPhotoDeleted(photo: Photo) {
    let index = this.photos.indexOf(photo);
    if (index >= 0) {
      this.photos.splice(index, 1);
    }
    if (this.photos.length == 0) {
      this.isEmpty = true;
    }
    this.masonry.reloadItems();
    this.masonry.layout();

    this.onScroll();
  }
  dragCounter: number = 0;
  checkIfFileHovered(e) {
    this.dragCounter++;
    var IsFile = this.isDragSourceExternalFile(e.dataTransfer);
    this.dropzoneHovered = IsFile;
    if (IsFile) {
      this.uploadButtonComponent.dropzoneHovered = true;
    }
  }
  checkIfFileHoveredOnLeave(e) {
    --this.dragCounter;
    if (this.dragCounter > 0) {
      this.dropzoneHovered = true;
    } else {
      this.dropzoneHovered = false;
      this.uploadButtonComponent.dropzoneHovered = false;
    }

  }
  dragFileDroped($event) {
    this.dropzoneHovered = false;
    this.uploadButtonComponent.dropzoneHovered = false;
    this.uploadButtonComponent.addFilesForUpload($event.dataTransfer.files);
    return false;
  }
  allowDrop(ev) {
    ev.preventDefault();
  }

  isDragSourceExternalFile(dataTransfer) {


    // Source detection for Firefox on Windows.
    if (typeof DOMStringList != 'undefined') {
      var DragDataType = dataTransfer.types;
      if (DragDataType.constructor == DOMStringList) {
        if (DragDataType.contains('Files'))
          return true;
        else
          return false;
      }
    }

    // Source detection for Chrome on Windows.
    if (typeof Array != 'undefined') {
      var DragDataType = dataTransfer.types;
      if (DragDataType.constructor == Array) {
        if (DragDataType.indexOf('Files') != -1)
          return true;
        else
          return false;
      }
    }
  }
  sendMessage(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.errorMessage = "", 3000);
  }
}
