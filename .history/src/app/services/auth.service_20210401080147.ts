import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { CommonService } from './common.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private af: AngularFirestore,
    private authFirebase: AngularFireAuth,
    private commonService: CommonService,
    private uidService: UserService,
  ) { }

  checkUser(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      let user;
      user = this.uidService.getUid()
      if (user) return resolve(true)
      user = await this.getUser()
      if (user) return resolve(true)
      user = await this.fireAuth()
      if (user) return resolve(true)
      return resolve(false)
    })
  }

  async getUser(): Promise<boolean> {
    return new Promise (async (resolve, reject) => {
      const uid = await this.commonService.getVariableFromStorage('uid')
      if (uid) {
        const nombre = await this.commonService.getVariableFromStorage('nombre')
        this.uidService.setUid(uid)
        this.uidService.setNombre(nombre)
        this.available(uid)
        resolve(true)
      } else resolve(false)
    })
  }

  async fireAuth(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const authSub = this.authFirebase.authState.subscribe(async (user) => {
        authSub.unsubscribe()
        if (user) {
          await this.setUser(user.uid, user.displayName)
          resolve(true)
        } else {
          resolve(false)
        }
      }, err => {
        console.log(err)
        resolve(false)
      })
    })
  }

  setUser(uid, nombre): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      this.commonService.setVariableToStorage('uid', uid)
      this.commonService.setVariableToStorage('nombre', nombre)
      this.uidService.setUid(uid)
      this.uidService.setNombre(nombre)
      resolve(true)
    })
  }

    // Auth

  async loginWithEmail(email, pass) {
    return new Promise(async (resolve, reject) => {
    try {
        const resp = await this.authFirebase.signInWithEmailAndPassword(email, pass)
        this.setUser(resp.user.uid, resp.user.displayName)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }


  async logout(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.authFirebase.signOut()
        this.commonService.removeFromStorage('uid')
        this.commonService.removeFromStorage('nombre')
        this.commonService.removeFromStorage('region')
        this.commonService.removeFromStorage('region')
        this.uidService.setUid(null)
        this.uidService.setNombre(null)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  available(uid: string) {
    console.log('Available');
    this.af.collection('usersystem', ref => ref.where('uid', '==', uid)).snapshotChanges()
    .pipe(map(resp => {
      resp.map(info => {
        console.log(info);
        console.log(info.payload.doc.data());
        console.log(info.payload.doc.id);
      })
    }))
  }

}
