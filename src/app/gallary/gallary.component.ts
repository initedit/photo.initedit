import { Component, OnInit,ChangeDetectorRef, ViewChild, HostListener } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PhotoService} from '../photo.service';
import { Photo } from '../model/Photo';
import { UploadButtonComponent } from '../upload-button/upload-button.component';
import { AppComponent } from '../app.component';
import { PhotoBaseResponse } from '../model/PhotoBaseResponse';
import { NgxMasonryComponent } from 'ngx-masonry';

@Component({
  selector: 'app-gallary',
  templateUrl: './gallary.component.html',
  styleUrls: [
    './gallary.component.css',
    '../../../node_modules/ng-masonry-grid/ng-masonry-grid.css',
    "../../../node_modules/font-awesome/css/font-awesome.css",
    '../../../node_modules/animate.css/animate.css'
  ]
})
export class GallaryComponent implements OnInit {
  name:string;
  showPasswordScreen:boolean=false;
  photos: Photo[] = [];
  isEmpty:boolean=false;
  _page:number=1;
  _loading:boolean=false;
  _isAllPhotoLoaded:boolean=false;
  photoResponse:PhotoBaseResponse;
  
  dropzoneHovered:boolean=false;
  @ViewChild(UploadButtonComponent)
  private uploadButtonComponent:UploadButtonComponent;
  isError: boolean=false;
  errorMessage: any;
  @ViewChild(NgxMasonryComponent)
  private masonry:NgxMasonryComponent;

  constructor(private route: ActivatedRoute,private photoService:PhotoService) { }

  ngOnInit() {
      this.name = this.route.snapshot.paramMap.get('name');
      this.refreshFeed();
  }
  @HostListener("document:paste",["$event"])
  onPasteContent(event){
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var index in items) {
      var item = items[index];
      if (item.kind === 'file') {
       var blob = item.getAsFile();
       this.uploadButtonComponent.addFilesForUpload([blob]);
      }
    }
  }

  refreshFeed(){
    this._page=1;
    this.photos.length=0;
    this.load();
  }

  handleLocking(){
    if(this.photoResponse){
      if(this.showPasswordScreen){
        this.showPasswordScreen = false;
      }else{
        this.showPasswordScreen = true;
      }
    }
  }

  load(){

    document.title = this.name + " - "+ AppComponent.title;
    this._loading=true;
    this.photoService.getPhoto(this.name,this._page)
    .subscribe((photoResponse:PhotoBaseResponse)=>{
      this.isError=false;
      this.photoResponse = photoResponse;
      if(photoResponse.code==401){
        this.showPasswordScreen=true;
        
      }else if(photoResponse.code==404){
        this.showPasswordScreen=false;
      }else{
        this.showPasswordScreen=false;
        this.photos = this.photos.concat(photoResponse.result);
        
        if(photoResponse.total<=this.photos.length)
        {
          this._isAllPhotoLoaded=true;
        }
      }
      if(!this.photos || this.photos.length===0)
          this.isEmpty=true;
        else
          this.isEmpty=false;
      this._loading=false;
    },
    error=>{
      this._loading=false;
      this.isError=true;
      this.errorMessage=error.message;
    });
  }

  onPasswordClosed(isClosed:boolean){
    this.showPasswordScreen=false;
  }
  uploadUpdate(result:Photo){
    if(result){
      this.photos.unshift(result);
      this.masonry.reloadItems();
      if(this.isEmpty)
        this.refreshFeed();
    }
  }
  removeItem(evnt:any){
   
  }
  onScroll(){
    if(this._isAllPhotoLoaded)
      return;
    
    this._page++;
    this.load();
  }
  OnPhotoDeleted(photo:Photo){
    let index = this.photos.indexOf(photo);
    if(index>=0){
      this.photos.splice(index,1);
    }
    if(this.photos.length==0){
      this.isEmpty=true;
    }

    this.onScroll();
  }
  dragCounter:number=0;
  checkIfFileHovered(e){
    this.dragCounter++;
    var IsFile =this.isDragSourceExternalFile(e.dataTransfer);
    this.dropzoneHovered = IsFile;
    if(IsFile){
      this.uploadButtonComponent.dropzoneHovered = true;
    }
  }
  checkIfFileHoveredOnLeave(e){
    --this.dragCounter;
    if(this.dragCounter>0)
    {
      this.dropzoneHovered=true;
    }else{
      this.dropzoneHovered=false;
      this.uploadButtonComponent.dropzoneHovered = false;
    }
    
  }
  dragFileDroped($event){
    this.dropzoneHovered=false;
    this.uploadButtonComponent.dropzoneHovered=false;
    this.uploadButtonComponent.addFilesForUpload($event.dataTransfer.files);
    return false;
  }
  allowDrop(ev) {
    ev.preventDefault();
  }

  isDragSourceExternalFile(dataTransfer){
    

    // Source detection for Firefox on Windows.
    if (typeof DOMStringList != 'undefined'){
        var DragDataType = dataTransfer.types;
        if (DragDataType.constructor == DOMStringList){
            if (DragDataType.contains('Files'))
                return true;
            else
                return false;
        }
    }

    // Source detection for Chrome on Windows.
    if (typeof Array != 'undefined'){
        var DragDataType = dataTransfer.types;
        if (DragDataType.constructor == Array){
            if (DragDataType.indexOf('Files') != -1)
                return true;
            else
                return false;
        }
    }
}
    sendMessage(message:string){
      this.errorMessage=message;
      setTimeout(()=>this.errorMessage="",3000);
    }
}
