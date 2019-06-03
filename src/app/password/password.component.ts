import { Component,EventEmitter, OnInit, Input, Output } from '@angular/core';
import { Location } from '@angular/common';
import { PhotoService } from '../photo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenBaseResponse } from '../model/TokenBaseResponse';


@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent implements OnInit {
  @Output() IOnClose = new EventEmitter<boolean>();
  password:string;
  name:string;
  isPasswordVisible:boolean=true;
  isCreated:boolean=false;
  _passwordType:string="text";
  selectedType:string="2";
  _message:string="";
  _initAuth:boolean=true;  
  constructor(private _route:ActivatedRoute,private _location: Location,private _service:PhotoService) { }

  ngOnInit() {
    this.name=this._route.snapshot.url[0].path;
    this.init(); 
  }


  init(){
    this._service.info(this.name)
    .subscribe(info=>{
      console.log(info)
      if(info.code===404)
      {
        this.isCreated=false;
      }else if(info.code===200){
        this.isCreated=true;
        this._passwordType="text";
        switch(info.type)
        {
          case "Public":this.selectedType="1";break;
          case "Protected":this.selectedType="2";break;
          case "Private":this.selectedType="3";break;
        }
        if(this.selectedType=="1"){
          this.isPasswordVisible=false;
        }else{
          this.isPasswordVisible=true;
          this._passwordType="password";
        }
        this.authenticate();

      }
    });
  }

  hideModel(isSuccess:boolean){
      this.IOnClose.emit(isSuccess);
  }
  authenticate(){
    let name = this._route.snapshot.url[0].path;
    let token = this.getPasswordFromUI();
    this._service.validate(name,token)
    .subscribe(response=>{
      if(response.code==200){
        this.saveToken(name,response);
      }else if(response.code==100){
        if(this._initAuth==true){
          this._initAuth=false;
          return;
        }
        this._message=response.message;
      }
    })
  }
  create(){
    let name = this._route.snapshot.url[0].path;
    let token = this.getPasswordFromUI();
    let type = this.selectedType;
    this._service.create(name,token,type)
    .subscribe(response=>{
      if(response.code===200)
      {
        this.saveToken(name,response);
      }
    });
  }
  getPasswordFromUI(){
    var passwordHash = require('password-hash');
    var hashedPassword = passwordHash.generate(this.password);
    return hashedPassword;
  }
  saveToken(name,tokenBaseResponse:TokenBaseResponse){
    console.log(tokenBaseResponse,name,"SaveToken")
    localStorage.setItem('currentSession', JSON.stringify({ token: tokenBaseResponse.token, name: name }));
    this.hideModel(true);
  }
  onPrivacyChanged(evnt){
    let el = evnt.target;
    let val = el.value;
    
    this.isPasswordVisible = val!=="1";
  }
}
