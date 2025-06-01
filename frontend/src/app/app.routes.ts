import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from "./landing/landingpage.component";
import { PlayComponent } from './play/play.component'
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
    { path: "", component: LandingComponent },
    { path: "play", component: PlayComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes), 
        CommonModule,            
        FormsModule, 
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }