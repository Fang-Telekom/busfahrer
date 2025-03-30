import { Component } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
  
@Component({
  selector: 'sticky-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: false
})
export class HeaderComponent {
    modalVisible: "log" | null = null;
    
    admin = false;
    logged = false;
    user = {"id": null, "name": null, "surname": null, "picture": null, "lvl": 0};
    isPlatFormBrowser

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
      this.isPlatFormBrowser = isPlatformBrowser(platformId);
    }
   
    ngOnInit() {
      // why this platform browser or due to change cookies error despite having read cookie
      if(!this.isPlatFormBrowser) return;

      let cook = this.getCookie("user")
      if(cook != null){
        this.user = JSON.parse(cook)
        
        if(this.user["id"] != null){
          this.logged = true

          if(this.user["lvl"] > 1)
            this.admin = true
        }
      }
    }
    
    regist = {
      id:null,
      vorname:"",
      nachname:"",
      password:"",
      lvl:"1",
      profilePicture: null as File | null,
    }

    selectedProfile(event: any) {
      this.regist.profilePicture = event.target.files[0];
    }

    toggleModal(modal: 'log' | null){
      this.modalVisible = modal;
    }


    async verify(name: String, pass: String): Promise<any>{
 
      let response = await fetch("http://127.0.0.1:8000/user/", {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({"name": name, "password": pass}),
        credentials: "include"
    })
    let cookie = await response.json()
    let d:Date = new Date();
    if(response.status==200){
      
      d.setTime(d.getTime() + 20 * 60 * 1000);
      let expires:string = `expires=${d.toUTCString()}`;
      this.user = cookie
      document.cookie = "user="+JSON.stringify(this.user)+`;${expires};path=/`

      this.logged = true

      if(this.user["lvl"] > 1)
        this.admin = true

      if(this.logged){
        this.toggleModal(null)
        if(this.admin) 
          window.location.href="/"
        else
          window.location.href="/"
      }
    }
  }


  getCookie(name: String) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if the cookie name matches
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }
    
}