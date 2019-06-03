import { Component, OnInit,Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  albumName:string;
  fullImageStylesPlaceholder: any = {};

  constructor(private router: Router,private renderer:Renderer2) { }

  ngOnInit() {
    document.title = AppComponent.title;
    this.fullImageStylesPlaceholder.backgroundImage="url('assets/img/home.jpg')";

    const element = this.renderer.selectRootElement('.photo-name-input');
    setTimeout(() => element.focus(), 0);
  }
  gotoAlbum(){
    let name = this.albumName && this.albumName.trim();
    if(name && name.length>0){
      name = name.replace(/  /g," ");
      name = name.replace(/ /g,"-");
      this.router.navigateByUrl("/"+name);
    }
  }
  // onChangeAlbumName(evnt:any){
  //   if(evnt.keyCode==13)
  //     this.gotoAlbum();
  // }
}