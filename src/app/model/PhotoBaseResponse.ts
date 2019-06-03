import { Photo } from './Photo';
import { BaseResponse } from './BaseResponse';

export class PhotoBaseResponse extends BaseResponse{
        result:Photo[];
        total:number;
}