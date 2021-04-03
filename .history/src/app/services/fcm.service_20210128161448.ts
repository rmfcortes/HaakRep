import { Injectable } from '@angular/core';

import { FCM } from '@ionic-native/fcm/ngx';

import { AngularFirestore } from '@angular/fire/firestore';

import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token: string

  constructor(
    private fcm: FCM,
    private db: AngularFirestore,
    private uidService: UserService,
  ) {  }

  requestToken(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      if (this.token) return resolve(true)
      this.fcm.getToken()
      .then(token => this.db.doc(`repartidores/${uid}/token`).update({token: token}))
      .then(() => resolve(true))
      .catch((error) => {
        reject(error)
      })
    })
  }

}
