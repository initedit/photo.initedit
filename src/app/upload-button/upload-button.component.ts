import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';
import { PhotoService } from '../photo.service';
import { ActivatedRoute } from '@angular/router';
import { Photo } from '../model/Photo';
import { PhotoUploadService } from '../photo-upload.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { SinglePhotoBaseResponse } from '../model/SinglePhotoBaseResponse';
import { IPhotoUploadLifeCycle } from '../model/iphoto-upload-life-cycle';
import { PhotoUpload } from '../model/PhotoUpload';

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
  @Output() ICallback = new EventEmitter<Photo>();
  @Output() IMessage = new EventEmitter<string>();
  _uploadRetry: PhotoUpload;
  currentAlbumName: string;
  isUploading: boolean = false;
  uploadItems: Array<PhotoUpload> = [];

  constructor(private _route: ActivatedRoute, private _service: PhotoService, private _uploadService: PhotoUploadService) { }
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
      this.showPasswordDialog = true;
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

  handleSuccessUpload(response: SinglePhotoBaseResponse) {

  }

  onPasswordClosed(isSuccess: boolean) {
    setTimeout(() => { this.showPasswordDialog = false }, 0);

    if (isSuccess) {
      if (this._uploadRetry) {
        this._uploadService.retry(this._uploadRetry)
        this._uploadRetry = null;

      } else {
        this.uploadToServer(this._lastEvnt);

      }
    }
  }

  authFailed(item: PhotoUpload) {
    if (item.albumName == this.currentAlbumName) {
      this.showPasswordDialog = true;
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

}
