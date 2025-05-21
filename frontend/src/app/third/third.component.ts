import { Component } from '@angular/core';

@Component({
  selector: 'third',
  templateUrl: './third.html',
  styleUrl: './third.css'
})
export class thirdComponent {
  open(){

  }
  next(){
    window.location.href="/"
  }
}