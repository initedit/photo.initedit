export class Photo{
        id:number;
        post_id:number;
        name:string;
        description:string;
        tags:string;
        path:PhotoPath;
        extra:string;
        width:number;
        height:number;
        size:number;
        status:number;
        created_at:Date;
        updated_at:Date;
}
class PhotoPath{
        thumb:string;
        original:string;
        big:string;
}