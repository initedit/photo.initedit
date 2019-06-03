import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {GallaryComponent} from './gallary/gallary.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {path:':name',component:GallaryComponent}
];

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ]
})
export class AppRoutingModule {

}
