
import { Injectable, NgZone } from '@angular/core';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { Platform } from '@ionic/angular';

import { Subscription } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';

import { UbicacionService } from './ubicacion.service';
import { UserService } from './user.service';

import { Order } from '../interfaces/order.interface';
import { OrdersService } from './orders.service';


@Injectable({
  providedIn: 'root'
})
export class BackgroundModeService {

  backSubscription: Subscription
  frontSubscription: Subscription

  notfications: Order[] = []

  constructor(
    private ngZone: NgZone,
    private platform: Platform,
    private db: AngularFireDatabase,
    public backgroundMode: BackgroundMode,
    private ubicacionService: UbicacionService,
    private orderService: OrdersService,
    private uidService: UserService,
  ) { }

  async initBackgroundMode() {
    this.platform.ready().then(() => {
      this.backgroundMode.setDefaults({silent: true})
      this.ubicacionService.setInterval()
      this.backgroundMode.enable()
      this.setFrontMode()
      this.setBackMode()
    })
  }

  setFrontMode() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    this.frontSubscription = this.backgroundMode.on('deactivate').subscribe(async () => {
      this.ngZone.run(() => {
        this.listenNotificationsOnBackground(false)
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
      })
    })
  }

  setBackMode() {
    if (this.backSubscription) this.backSubscription.unsubscribe()
    this.backSubscription =  this.backgroundMode.on('activate').subscribe(() => {
      this.ngZone.run(() => {
        this.listenNotificationsOnBackground(true)
        this.backgroundMode.disableWebViewOptimizations()
        this.ubicacionService.clearInterval()
        this.ubicacionService.setInterval()
      })
    })
  }

  listenNotificationsOnBackground(inBackground: boolean) {
    const uid = this.uidService.getUid()
    this.db.object(`repartidor_send/${uid}`).query.ref.off('child_added')
    this.db.object(`repartidor_send/${uid}`).query.ref.on('child_added', snap => {
      this.ngZone.run(() => {
        const notification: Order = snap.val()
        if (this.notfications.length === 0) {
          this.orderService.newOrder(notification)
          this.notfications.push(notification)
          if (inBackground) this.unlock()
        } else {
          const i = this.notfications.findIndex(n => n.id_order === notification.id_order)
          if (i < 0) {
            this.orderService.newOrder(notification)
            this.notfications.push(notification)
            if (inBackground) this.unlock()
          }
        }
      })
    })
  }

  removeNotification(idOrder: string) {
    this.notfications = this.notfications.filter(n => n.id_order !== idOrder)
  }

  stopListenNotificationsBack() {
    const uid = this.uidService.getUid()
    this.db.object(`notifications/${uid}`).query.ref.off('child_added')
  }

  unlock() {
    this.backgroundMode.unlock()
  }

  deshabilitaBackground() {
    if (this.frontSubscription) this.frontSubscription.unsubscribe()
    if (this.backSubscription) this.backSubscription.unsubscribe()
    this.backgroundMode.disable()
  }


}

