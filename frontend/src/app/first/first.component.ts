import { Component } from '@angular/core';

@Component({
  selector: 'first',
  templateUrl: './first.html',
  styleUrl: './first.css'
})
export class firstComponent {
  draw(){

  }
  open(){

  }
  next(){
    window.location.href="/second"
  }
}