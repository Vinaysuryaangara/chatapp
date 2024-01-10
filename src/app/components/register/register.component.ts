import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { NavigationCancellationCode } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ChatService } from 'src/app/services/chat/chat.service';
import { setUserData } from 'src/app/state/app.action';
import { UserData } from 'src/app/state/app.selector';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  @ViewChild('registered') registered: any;
  registerData!: FormGroup
  array: any;
  loginData: any;
  constructor(private fb: FormBuilder, private service: ChatService,
    private modalService: NgbModal, private http: HttpClient, private store: Store
  ) {
    this.registerData = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      photo:['', Validators.required]
    })
  }
  ngOnInit() {
    this.store.dispatch(setUserData())

  }
  openPopup(content: any): void {
    this.modalService.open(content, { backdrop: 'static', centered: true });
  }
  RegisterForm() {
    // this.store.dispatch(setUserData())
    if (this.registerData.valid) {
      this.store.select(UserData).subscribe((res) => {
        this.loginData = JSON.parse(JSON.stringify(res))
      })
      console.log(this.loginData, "1111")
      let obj: any = {}
      for (let i = 1; i < this.loginData.length + 1; i++) {
        if (i !== this.loginData.length + 1) {
          obj[i] = `room-${(uuidv4())}`
        }
      }
      console.log(obj, "48::::")
      if (this.loginData.length) {
        Object.keys(obj).forEach((val, i) => {
          console.log(val, i, "51::::")
          this.loginData[i].roomId[this.loginData.length + 1] = obj[val]
        })
        this.service.updateRoomId(obj).subscribe()
      }

      let data = {
        id: this.loginData.length + 1,
        name: this.registerData.get('name')?.value,
        phone: this.registerData.get('phone')?.value,
        image: `http://192.168.10.16:3000/uploads/${this.url}`,
        roomId: obj,
        newMessage: 0,
        lastmsg : {}
      }
      this.loginData.push(data)
      console.log(this.loginData, "5555%%%", obj)
      this.service.updateRegisterData(data).subscribe((res)=>{
        this.service.newUser({
          user: data.name,
          room: 'register',
          phone: data.phone
        })
      })
      
      this.openPopup(this.registered)
    }
  }
  //  images selction change

  url: any;
  msg = "";

  selectFile(event: any) {
    const selectedFile = event.target.files[0];
    console.log(selectedFile.name, 'img')
    const formData = new FormData()
    formData.append('image', selectedFile)
    if (selectedFile) {
      this.service.uploadImage(formData).subscribe()
      this.url = selectedFile.name;
    }
  }
  phoneNumValidation(evt: any) {
    if (evt.target.value.length > 9) {
      evt.preventDefault()
      return
    }
  }
}