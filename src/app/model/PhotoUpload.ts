import { SinglePhotoBaseResponse } from "./SinglePhotoBaseResponse";

export class PhotoUpload {
        id:string;
        albumName:string;
        name:string;
        description:string;

        progress:number;
        uploaded:number;
        total:number;
        response:SinglePhotoBaseResponse;
        request:FormData;
        errorMessage:string;
        
        IS_STARTED:boolean=false;
        IS_ERROR:boolean=false;
        IS_COMPLETED:boolean=false;
        IS_DONE:boolean=false;
        
}
