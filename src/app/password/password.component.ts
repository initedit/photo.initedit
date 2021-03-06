import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Location } from '@angular/common';
import { PhotoService } from '../photo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenBaseResponse } from '../model/TokenBaseResponse';
import passwordHash from '../../../node_modules/password-hash';
import { AlbumInfoResponse } from '../model/AlbumResponse';
//declare var require:any;

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  @Output() IOnClose = new EventEmitter<boolean>();
  @Input() albumInfo: AlbumInfoResponse
  password: string;
  name: string;
  isPasswordVisible: boolean = true;
  isCreated: boolean = true;
  _passwordType: string = "password";
  selectedType: string = "2";
  _message: string = "";
  _initAuth: boolean = true;
  constructor(private _route: ActivatedRoute, private _service: PhotoService) { }

  ngOnInit() {
    this.name = this._route.snapshot.url[0].path;
    this.init();

  }


  init() {
    if (this.albumInfo) {
      console.log(this.albumInfo);

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
    this.IOnClose.emit(isSuccess);
  }
  authenticate() {
    let name = this._route.snapshot.url[0].path;
    let token = this.getPasswordFromUI();
    this._service.validate(name, token)
      .subscribe(response => {
        if (response.code == 200) {
          this.saveToken(name, response);
        } else if (response.code == 100) {
          if (this._initAuth == true) {
            this._initAuth = false;
            return;
          }
          this._message = response.message;
        }
      })
  }
  create() {
    let name = this._route.snapshot.url[0].path;
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
