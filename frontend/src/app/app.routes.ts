import { RouterModule, Routes } from '@angular/router';

import { LandingComponent } from "./landing/landingpage.component";
import { firstComponent } from './first/first.component';
import { waitingComponent } from './waiting/waiting.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
    { path: "home", component: LandingComponent },
    { path: "first", component: firstComponent },
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