import { Component } from '@angular/core';
import { console } from 'node:inspector';

@Component({
  selector: 'landingpage',
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css'
})
export class LandingComponent {
  
  modalVisible: "party" | null = null;
  toggleModal(modal: 'party' | null ){
    this.modalVisible = modal;
  }
  async verify(name:string, code: string){
    var room = code.trim()
    var username = name.trim()

    const isValid = /^[a-zA-Z0-9, ß, ä, ü, ö]+$/;

    if (room && !isValid.test(room)) {
      alert("Raumname darf nur Buchstaben und Zahlen enthalten!");
      return;
    }
    if (username && !isValid.test(username)) {
      alert("Benutzername darf nur Buchstaben und Zahlen enthalten!");
      return;
    }

    if(room == "")
      room = Math.random().toString(36).substring(2, 8);
    if(username == "")
      username= "Guest_"+Math.floor(Math.random() * 10000) 
    
    window.location.href = `/play?room=${room}&username=${username}`;
  }
  async create(name: String){
    const room = Math.random().toString(36).substring(2, 8); // generate random room
    window.location.href = `/play?room=${room}&username=${name}`;
  }

}