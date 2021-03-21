import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PhotoService } from '../photo.service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../model/Photo';
import { PhotoUploadService } from '../photo-upload.service';
import { SinglePhotoBaseResponse } from '../model/SinglePhotoBaseResponse';
import { IPhotoUploadLifeCycle } from '../model/iphoto-upload-life-cycle';
import { PhotoUpload } from '../model/PhotoUpload';
import { PasswordComponent } from '../password/password.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlbumInfoResponse } from '../model/AlbumResponse';

@Component({
  selector: 'app-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.css']
})
export class UploadButtonComponent implements OnInit, IPhotoUploadLifeCycle {


  toggleUploadProgress: boolean = false;
  showPasswordDialog: boolean = false;
  _isPasswordShown: boolean;
  _lastEvnt: any;
  dropzoneHovered: boolean = false;
  @Input() albumName: string;
  @Input() albumInfo: AlbumInfoResponse;
  @Output() ICallback = new EventEmitter<Photo>();
  @Output() IMessage = new EventEmitter<string>();
  _uploadRetry: PhotoUpload;
  currentAlbumName: string;
  isUploading: boolean = false;
  uploadItems: Array<PhotoUpload> = [];
  passwordDialog: MatDialogRef<PasswordComponent, any> = null;

  constructor(private _route: ActivatedRoute, private _service: PhotoService, private _uploadService: PhotoUploadService, private dialog: MatDialog) { }
  ngOnInit() {
    this._uploadService.setCallback(this);
    this.currentAlbumName = this._route.snapshot.url[0].path;
  }
  showUploadDialog() {

  }
  uploadToServer(evnt: any) {
    this.dropzoneHovered = false;
    this._lastEvnt = evnt;
    let activeAlbumWithToken = this.albumName;

    if (this.currentAlbumName === activeAlbumWithToken) {
      let elPhoto = evnt.target;
      this.addFilesForUpload(elPhoto.files);
    } else {
      this.openPasswordDialog();
    }
  }

  addFilesForUpload(files) {

    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        let file: File = files[i];
        let photoFile = file;
        let name = photoFile.name;
        let description = "";
        let tags = "";
        let extra = "";
        let image = photoFile;
        this._uploadService.add(this.currentAlbumName, name, description, tags, image, extra)
      }
    }
  }

  authFailed(item: PhotoUpload) {
    if (item.albumName == this.currentAlbumName) {
      this.openPasswordDialog();
      this._uploadRetry = item;
    }
  }
  uploaded(item: PhotoUpload) {
    this.ICallback.emit(item.response.result);
  }
  postProgress(item: PhotoUpload) {
    this.isUploading = this._uploadService.IsUploadingAny();
    this.uploadItems = this._uploadService.GetUploadList();
    if (item.IS_ERROR) {
      this.IMessage.emit(item.errorMessage);
    }
  }

  openPasswordDialog() {
    if (this.passwordDialog == null) {
      this.passwordDialog = this.dialog.open(PasswordComponent, {
        data: {
          albumName: this.albumName,
          albumInfo: this.albumInfo,
        },
        position: {
          top: '20px'
        },
        minWidth: 300
      });

      this.passwordDialog.afterClosed().subscribe(isLoggedIn => {
        this.passwordDialog = null
        if (isLoggedIn) {
          if (this._uploadRetry) {
            this._uploadService.retry(this._uploadRetry)
            this._uploadRetry = null;
          } else {
            this.uploadToServer(this._lastEvnt);
          }
        }
      });
    }
  }

}
