import { Component } from '@angular/core';

@Component({
  selector: 'second',
  templateUrl: './second.html',
  styleUrl: './second.css'
})
export class secondComponent {
  open(){

  }
  next(){
    window.location.href="/third"
  }
}