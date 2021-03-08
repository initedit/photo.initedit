import { Component, EventEmitter, OnInit, Input, Output, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { PhotoService } from '../photo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenBaseResponse } from '../model/TokenBaseResponse';
import passwordHash from '../../../node_modules/password-hash';
import { AlbumInfoResponse } from '../model/AlbumResponse';
import { ToastService } from '../toast.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
//declare var require:any;

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  @Output() IOnClose = new EventEmitter<boolean>();
  albumInfo: AlbumInfoResponse
  password: string;
  name: string;
  isPasswordVisible: boolean = true;
  isCreated: boolean = true;
  _passwordType: string = "password";
  selectedType: string = "2";
  _message: string = "";
  constructor(public dialogRef: MatDialogRef<PasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _service: PhotoService, private toastService: ToastService) { }

  ngOnInit() {
    this.name = this.data.albumName;
    this.albumInfo = this.data.albumInfo
    this.init();

  }


  init() {
    if (this.albumInfo) {

      if (this.albumInfo.code === 404) {
        this.isCreated = false;
      } else if (this.albumInfo.code === 200) {
        this.isCreated = true;
        this._passwordType = "password";
        switch (this.albumInfo.type) {
          case "Public": this.selectedType = "1"; break;
          case "Protected": this.selectedType = "2"; break;
          case "Private": this.selectedType = "3"; break;
        }

        if (this.selectedType == "1") {
          this.isPasswordVisible = false;
        } else {
          this.isPasswordVisible = true;
          this._passwordType = "password";
        }
        this.authenticate();
      }
    }

  }

  hideModel(isSuccess: boolean) {
    this.dialogRef.close(false);
  }
  authenticate() {

    let token = this.getPasswordFromUI();
    if (token.length == 0) {
      return;
    }
    this._service.validate(this.name, token)
      .subscribe(response => {
        if (response.code == 200) {
          this.saveToken(this.name, response);
          this.dialogRef.close(true);
        } else if (response.code == 100) {
          this.toastService.toast(response.message);
        } else {
          this.toastService.toast(response.message);
        }
      })
  }
  create() {
    let name = this.name;
    let token = this.getPasswordFromUI();
    let type = this.selectedType;
    this._service.create(name, token, type)
      .subscribe(response => {
        if (response.code === 200) {
          this.saveToken(name, response);
        }
      });
  }
  getPasswordFromUI() {

    if (this.password != undefined) {
      var hashedPassword = this.password;
      return hashedPassword;
    }
    return "";
  }
  saveToken(name, tokenBaseResponse: TokenBaseResponse) {
    localStorage.setItem('currentSession', JSON.stringify({ token: tokenBaseResponse.token, name: name }));
    this.hideModel(true);
  }
  onPrivacyChanged(evnt) {
    let el = evnt.target;
    let val = el.value;

    this.isPasswordVisible = val !== "1";
  }
}
