import { Injectable, NgZone } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { FCM, NotificationData } from '@ionic-native/fcm/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';

import { UbicacionService } from './ubicacion.service';
import { UserService } from './user.service';

import { Order } from '../interfaces/order.interface';


@Injectable({
  providedIn: 'root'
})
export class FcmService {

  token: string
  notifcationSub: Subscription

  new_order = new BehaviorSubject<Notificacion>(null)

  constructor(
    private fcm: FCM,
    private ngZone: NgZone,
    private audio: NativeAudio,
    private db: AngularFirestore,
    private ubicacionService: UbicacionService,
    private uidService: UserService,
  ) {  }

  initAudio(): Promise<boolean>{
    return new Promise(async (resolve, reject) => {      
      this.audio.preloadSimple('alerta', 'assets/sounds/loving-you.mp3')
      this.audio.preloadSimple('mensaje', 'assets/sounds/mensaje.mp3')
      resolve(true)
    })
  }

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

  async newNotification(notification: Order, inBackground: boolean) {
    this.silenciar()
    const distancia = await this.ubicacionService.getDistancia(
      parseFloat(notification.negocio_lat),
      parseFloat(notification.negocio_lng)
    )
    const nuevo_pedido: Notificacion = {
      cliente: notification.cliente,
      idNegocio: notification.idNegocio,
      cliente_direccion: notification.cliente_direccion,
      cliente_lat: parseFloat(notification.cliente_lat),
      cliente_lng: parseFloat(notification.cliente_lng),
      createdAt: parseInt(notification.createdAt, 10),
      idPedido: notification.idPedido,
      negocio: notification.negocio,
      negocio_direccion: notification.negocio_direccion,
      negocio_lat: parseFloat(notification.negocio_lat),
      negocio_lng: parseFloat(notification.negocio_lng),
      notificado: parseInt(notification.notificado, 10),
      ganancia: parseInt(notification.ganancia, 10),
      propina: parseInt(notification.propina, 10),
      distancia,
      solicitudes: parseInt(notification.solicitudes, 10)
    }
    this.pedido_nuevo.next(nuevo_pedido)
    if (nuevo_pedido.solicitudes < 3) this.clearNotifications(nuevo_pedido.idPedido, nuevo_pedido.notificado)
    if (inBackground) this.playAlert()
    else this.playMensaje()
  }

  playAlert() {
    this.audio.play('alerta')
  }

  playMensaje() {
    this.audio.play('mensaje')
  }

  cleanPedidoSub() {
    this.pedido_nuevo.next(null)
  }

  clearNotifications(idPedido: string, notificado: number) {
    const espera = this.uidService.getTolerancia()
    const tolerancia = notificado + espera - 5000
    const uid = this.uidService.getUid()
    setTimeout(() => this.db.object(`notifications/${uid}/${idPedido}`).remove(), tolerancia)
  }

  silenciar() {
    this.audio.stop('alerta')
  }

  unsubscribeMensajes() {
    if (this.notifcationSub) this.notifcationSub.unsubscribe()
  }

}
