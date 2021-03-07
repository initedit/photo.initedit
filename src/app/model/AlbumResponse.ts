import { BaseResponse } from "./BaseResponse";
import { Photo } from "./Photo";

export class AlbumInfoResponse {
  code: number;
  message: string;
  type: string;
}

export class PostMetaSingleResponse extends BaseResponse {
  result: {
    item: Photo,
    next: Photo,
    previous: Photo
  }
}
