import { PhotoUpload } from "./PhotoUpload";

export interface IPhotoUploadLifeCycle {
        uploaded(item: PhotoUpload);
        authFailed(item:PhotoUpload);
        postProgress(item:PhotoUpload);
}
