import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { IonInput, Platform } from '@ionic/angular';

import { CommonService } from 'src/app/services/common.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  correo: string
  pass: string

  err: string
  form: FormGroup
  validation_messages: any

  constructor(
    private router: Router,
    private platform: Platform,
    private authService: AuthService,
    private alertService: CommonService,
  ) { }

  ngOnInit() {
    this.setForm()
  }

  setForm() {
    this.form = new FormGroup({
      'email': new FormControl('', Validators.compose([Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')],)),
      'password': new FormControl('', Validators.compose([Validators.required, Validators.minLength(6)])),
      'isPersistent': new FormControl(true)
    },
    { updateOn: 'change'})

    this.validation_messages = {
      'email': [
          { type: 'required', message: 'Este campo es necesario' },
          { type: 'pattern', message: 'El correo escrito no es un correo válido' },
        ],
        'password': [
          { type: 'required', message: 'Este campo es requerido' },
          { type: 'minlength', message: 'La contraseña debe tener al menos 6 caracteres' },
        ],
      }
  }
  
  async blur(nextElement: IonInput) {
    const h: HTMLInputElement = await nextElement.getInputElement()
    h.blur()
    this.ingresarConCorreo()
  }

  async ingresarConCorreo() {
    this.form.controls.email.markAsTouched()
    this.form.controls.password.markAsTouched()
    if (!this.form.valid) return
    await this.alertService.presentLoading()
    this.err = ''
    try {
      const correo = this.form.value.email.trim() 
      const resp = await this.authService.loginWithEmail(correo, this.form.value.password)
      this.alertService.dismissLoading()
      if (resp) this.router.navigate(['/home'])
      else this.alertService.presentAlert('Usuario no registrado', 'Por favor registra una cuenta antes de ingresar', 'Aceptar')
    } catch (error) {
      this.alertService.dismissLoading()
      if (error.code === 'auth/user-not-found') {
        this.alertService.presentAlert('Usuario no registrado', 'Por favor registra tu cuenta antes de ingresar', 'Aceptar')
      } else if (error.code === 'auth/wrong-password') {
        this.alertService.presentAlert('Contraseña inválida', 'La contraseña no es correcta, por favor intenta de nuevo', 'Intentar de nuevo')
      } else {
        this.alertService.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo' + error, 'Enterado')
      }
    }
  }

}
