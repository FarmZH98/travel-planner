import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private readonly fb = inject(FormBuilder)
  private readonly router = inject(Router)
  private readonly loginService = inject(LoginService)

  token = "";

  form!: FormGroup

  ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control<string>('', [ Validators.required ]),
      password: this.fb.control<string>('', [ Validators.required ])
    })
  }

  login() {
    console.info(">>> form: ", this.form.value)

    //communicate with backend
    this.loginService.login(this.form.value['username'], this.form.value['password'])
      .then((response: any) => 
        {
          //store token
          this.token = response.token
          console.log(this.token)
          localStorage.setItem('token', this.token)
        })

    this.router.navigate(['/home'], { queryParams: { token: this.token } })

    //this.router.navigate(['/games'], { queryParams: { q: this.form.value['q'] } })
  }

}
