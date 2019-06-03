import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpEvent, HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { SinglePhotoBaseResponse } from './model/SinglePhotoBaseResponse';
import { PhotoService } from './photo.service';
import { PhotoUpload } from './model/PhotoUpload';
import { IPhotoUploadLifeCycle } from './model/iphoto-upload-life-cycle';

@Injectable({
  providedIn: 'root'
})
export class PhotoUploadService {
 
  static photoUploadList:Array<PhotoUpload> = [];
  static NEXT_UPLOAD_INDEX:number=0;
  static MAX_FILE_UPLOAD_SIZE:number=1024*1024*5;
  callback:IPhotoUploadLifeCycle;

  constructor( private http: HttpClient) { }


  setCallback(callback:IPhotoUploadLifeCycle){
    this.callback=callback;
  }

  retry(item:PhotoUpload){
    this.addByFormData(item.albumName,item.request)
  }

  addByFormData(albumName:string,formData:FormData):PhotoUpload{
    let httpOptions = PhotoService.getHeaders(albumName);
    httpOptions.reportProgress=true;
    httpOptions.observe='events';
    var photoUpload:PhotoUpload = new PhotoUpload();
    photoUpload.id = this.GetNextUploadIndex().toString();
    photoUpload.name = formData.get("name").toString();
    photoUpload.albumName=albumName;
    photoUpload.request = formData;

    let imageFile:File = formData.get("image") as File;
    let shouldUpload = imageFile.size<=PhotoUploadService.MAX_FILE_UPLOAD_SIZE;
    if(!shouldUpload){
      photoUpload.IS_ERROR=true;
      photoUpload.IS_DONE=true;
      photoUpload.errorMessage="File size too big";
    }
    PhotoUploadService.photoUploadList.push(photoUpload);

    this.callback.postProgress(photoUpload);
    if(shouldUpload){
      this.http.post<SinglePhotoBaseResponse>
      (PhotoService.getAPIPath("/photo/upload"),formData,httpOptions)
      .subscribe( (event: HttpEvent<SinglePhotoBaseResponse>) => {
        console.log(event);
        switch (event.type) {
          case HttpEventType.Sent:
            photoUpload.IS_STARTED=true;
            this.callback.postProgress(photoUpload);
            break;
          case HttpEventType.Response:
            var httpResponse:HttpResponse<SinglePhotoBaseResponse> = event;
            var response = httpResponse.body;
            photoUpload.response = response;
            photoUpload.IS_DONE=true;
            photoUpload.IS_COMPLETED=true;
            
            if(response.code==100){
              photoUpload.errorMessage=response.message;
              photoUpload.IS_ERROR=true;
            }
            
            this.callback.postProgress(photoUpload);
            
            if(response.code==401){
              this.callback.authFailed(photoUpload);
            }else if(response.code==404){
              this.callback.authFailed(photoUpload);
            }else if(response.code==200){
              this.callback.uploaded(photoUpload);
            }
            break;
          case HttpEventType.UploadProgress: {
            photoUpload.total = event['total'];
            photoUpload.uploaded = event['loaded'];
            photoUpload.progress = photoUpload.uploaded / photoUpload.total * 100;
            
            this.callback.postProgress(photoUpload);
            break;
          }
        }
      },error=>{
        photoUpload.IS_DONE=true;
        photoUpload.IS_ERROR=true;
        photoUpload.errorMessage = "Something went wrong!";
        this.callback.postProgress(photoUpload);
      });
    }
    return photoUpload;
  }

  add(albumName:string,name:string,description:string,tags:string,image:File,extra:string):PhotoUpload{
    
    let formData:FormData = new FormData();
    formData.append("name",name);
    formData.append("description",description);
    formData.append("tags",tags);
    formData.append("image",image);
    formData.append("extra",extra);
    return this.addByFormData(albumName,formData);
  }

  GetNextUploadIndex():number
  {
    return PhotoUploadService.NEXT_UPLOAD_INDEX++;
  }

  GetUploadList():Array<PhotoUpload>{
    return PhotoUploadService.photoUploadList;
  }

  IsUploadingAny():boolean{
    if(PhotoUploadService.photoUploadList){
      for(var i=0;i<PhotoUploadService.photoUploadList.length;i++){
        let photoUpload = PhotoUploadService.photoUploadList[i];
        if(!photoUpload.IS_DONE)
        {
          return true;
        }
      }
    }  
    return false;
  }

}
