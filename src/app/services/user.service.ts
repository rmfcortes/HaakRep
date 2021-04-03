import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  uid: string
  nombre: string

  constructor() { }

  setUid(uid) {
    console.log(uid);
    this.uid = uid
  }

  getUid() {
    return this.uid
  }

  setNombre(nombre) {
    this.nombre = nombre
  }

  getNombre() {
    return this.nombre
  }


}
