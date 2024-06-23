import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})

//route back to login page after sign up
export class SignUpComponent implements OnInit {

  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly loginService = inject(LoginService)

  token = "";

  form!: FormGroup
  genders: string[] = ['Male', 'Female' , 'Other']; 
  hide = signal(true);
  isPasswordVisible = false

  ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control<string>('', [ Validators.required, Validators.minLength(5) ]),
      password: this.fb.control<string>('', [ Validators.required, Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}') ]), //at least 8 chars and alphanum
      firstname: this.fb.control<string>('', [ Validators.required ]),
      lastname: this.fb.control<string>('', [ Validators.required ]),
      email: this.fb.control<string>('', [ Validators.required, Validators.email ]),
      gender: this.fb.control<string>('', [ Validators.required ]) //radio button.
    })
  }

  signup() {
    //console.info(">>> form: ", this.form.value)
    const formVal = this.form.value
    //send sign up request to backend, and notify if success (send fail if username taken and stay at page)
    this.loginService.signup(formVal)
      .then( (response: any) => 
        {
          alert(response.message)
          console.log(response)
          this.router.navigate(['/'])
        })
      .catch(response =>
        alert(response.error.message)
        
      )
  }


}
