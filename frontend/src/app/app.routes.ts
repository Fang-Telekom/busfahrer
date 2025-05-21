import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from "./landing/landingpage.component";
import { firstComponent } from './first/first.component';
import { secondComponent } from './second/second.component';
import { thirdComponent } from './third/third.component';
import { PlayComponent } from './play/play.component'
import { waitingComponent } from './waiting/waiting.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
    { path: "home", component: LandingComponent },
    { path: "first", component: firstComponent },
    { path: "second", component: secondComponent },
    { path: "third", component: thirdComponent },
    { path: "play", component: PlayComponent },
    { path: "waiting", component: waitingComponent },
    {path: "", redirectTo: "/home", pathMatch: "full" }
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