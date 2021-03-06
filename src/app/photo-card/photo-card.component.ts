import { Component, OnInit, Input, Output,EventEmitter } from '@angular/core';
import { AlbumInfoResponse } from '../model/AlbumResponse';
import { Photo } from '../model/Photo';
import { PhotoService } from '../photo.service';


@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.component.html',
  styleUrls: ['./photo-card.component.css',
  "../../../node_modules/font-awesome/css/font-awesome.css",
  '../../../node_modules/animate.css/animate.css']
})
export class PhotoCardComponent implements OnInit {
  @Input() photo:Photo;
  @Input() albumName:string;
  @Output() OnDeleted = new EventEmitter<Photo>();
  currentStyles={
    backgroundImage:"",
    height:"",
  };
  fullImageStyles={
    backgroundImage:""
  }
  _perRow = 1;
  _fullscreen: boolean=false
  _isEditing:boolean=false
  fullImageStylesPlaceholder: any = {};
  editMessage: string;
  _showInfo:boolean=false;
  _isDeleting: boolean;


  constructor(private service:PhotoService) { }

  ngOnInit() {
    this.setup();
    let ratio = this.photo.height/this.photo.width;
    let w = (window.screen.availWidth - (10*this._perRow))/this._perRow;
    let h = w*ratio;

    this.currentStyles.backgroundImage="url('"+ this.photo.path.thumb +"')";
    this.currentStyles.height=h+"px";

  }

  setup(){
    let w = window.screen.availWidth;
    if(w>1024){
      this._perRow=4;
    }else if(w>720){
      this._perRow=2;
    }else{
      this._perRow=1;
    }
  }
  showFullImage()
  {
    this._fullscreen=true;
    this.fullImageStylesPlaceholder.backgroundImage="url('"+ this.photo.path.thumb +"')";
    this.fullImageStyles.backgroundImage="url('"+ this.photo.path.big +"')";
  }
  downloadImage(){
    this.service.downloadPhoto(this.photo);
  }
  deletePhoto(){
    this._isDeleting = true;
    this.service.deletePhoto(this.albumName, this.photo)
    .subscribe(response=>{
      if(response.code==200)
      {
        this._fullscreen=false;
        if(this.OnDeleted)
        {
          this.OnDeleted.emit(this.photo);
        }
      }
    },error=>{
      console.log(error);
    },()=>{
      this._isDeleting = false;

    });
  }
  editPhotoCard(){
    this._isEditing=true;
  }
  updatePhoto(){
    this.service.update(this.albumName,this.photo.id.toString(),this.photo.name,this.photo.description,this.photo.tags,this.photo.extra)
    .subscribe(response=>{
      if(response.code==200)
      {

      }
      this.editMessage=response.message;
    });
  }

  hideOnOverlayClick(event){
  }

}
