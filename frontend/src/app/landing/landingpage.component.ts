import { Component } from '@angular/core';
import { console } from 'node:inspector';

@Component({
  selector: 'landingpage',
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css'
})
export class LandingComponent {
  
  modalVisible: "party" | null | "create"= null;
  toggleModal(modal: 'party' | null | "create"){
    this.modalVisible = modal;
  }
  async verify(name:String, code: String){

  }
  async create(name: String){
    if (!name.trim()) {
      alert("Name darf nicht leer sein.");
      return;
    }
    let response = await fetch("http://127.0.0.1:8000/play/create/", {
      headers: {'Content-Type': 'application/json'},
      method: 'POST',
      body: JSON.stringify({"name": name})
    })
    let code = await response.json()
    let d:Date = new Date();
    if(response.status==200){
      
      d.setTime(d.getTime() + 20 * 60 * 1000);
      let expires:string = `expires=${d.toUTCString()}`;
      document.cookie = "code="+JSON.stringify(code)+`;${expires};path=/`
      window.location.href="/waiting"
      
    }
  }
  async play(){
    window.location.href="/play"
  }
}