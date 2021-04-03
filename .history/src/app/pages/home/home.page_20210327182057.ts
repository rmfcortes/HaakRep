import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { OrderPage } from 'src/app/modals/order/order.page';

import { BackgroundModeService } from 'src/app/services/background.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { CommonService } from 'src/app/services/common.service';
import { OrdersService } from 'src/app/services/orders.service';
import { AudioService } from 'src/app/services/audio.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { FcmService } from 'src/app/services/fcm.service';

import { Address, Order, Pedido } from 'src/app/interfaces/order.interface';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy{

  orders: Pedido[] = []
  new_orders: Pedido[] = []

  nombre: string

  orderSub: Subscription
  new_orderSub: Subscription

  saldo = 0
  saldoSub: Subscription

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private backgroundMode: BackgroundModeService,
    private ubicacionService: UbicacionService,
    private commonService: CommonService,
    private orderService: OrdersService,
    private audioService: AudioService,
    private authService: AuthService,
    private uidService: UserService,
    private fcmService: FcmService,
  ) {}

  ngOnInit() {
    this.init()
  }

  async init(event?) {
    setTimeout(() => {
      this.orderService.testOrder()
    }, 5000)
    this.orders = []
    this.new_orders = []
    this.nombre = this.uidService.getNombre()
    await this.audioService.initAudio()
    this.backgroundMode.initBackgroundMode()
    this.getOrders(event)
    this.listenPedidosNuevos()
    this.listenSaldo()
    this.fcmService.requestToken()
    this.backgroundMode.listenNotificationsOnBackground(false)
  }

  listenSaldo() {
    if (this.saldoSub) this.saldoSub.unsubscribe()
    this.saldoSub = this.orderService.getSaldo().subscribe((saldo: number) => this.saldo = saldo)
  }

  getOrders(event?) {
    if(this.orderSub) this.orderSub.unsubscribe()
    this.orderSub = this.orderService.getOrders().subscribe((orders: Pedido[]) => {
      this.ngZone.run(() => {
        this.orders = orders
        if (this.orders && this.orders.length > 0) {
          this.orders.forEach(or => {
            const i = this.new_orders.findIndex(p => p.id_order === or.id_order)
            if (i >= 0) this.new_orders.splice(i, 1)
          })
        }
        if (event) {
          event.target.complete()
          this.commonService.presentToast('Lista de pedidos actualizada')
        }
      })
    })
  }

  listenPedidosNuevos() { // if is Asociado Data
    this.new_orderSub = this.orderService.new_order.subscribe((order: Pedido) => {
      this.ngZone.run(() => {
        if (order) {
          if (this.new_orders.length === 0) {
            this.new_orders.push(order)
          } else {
            const i = this.new_orders.findIndex(p => p.id_order === order.id_order)
            if (i < 0) this.new_orders.push(order)
          }
        }
      })
    })
  }

  async seeOrder(order: Order) {
    this.commonService.setOrderTemporal(null)
    const modal = await this.modalCtrl.create({
      component: OrderPage,
      componentProps: {order}
    })

    return await modal.present()
  }

  aceptOrder(order: Order) { // solo para Asociados
    this.orderService.aceptOrder(order)
    this.new_orders = this.new_orders.filter(o => o.id_order !== order.id_order)

  }

  llamar(numero) {
    console.log('LLmar a ' + numero);
    this.callNumber.callNumber(numero, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err))
  }

  navigate(address: Address) {
    const numbers = [address.lat, address.lng]
    this.ubicacionService.navigate(numbers)
  }

  async cerrarSesion() {
    this.cancelSub()
    await this.authService.logout()
    this.router.navigate(['/login'])
  }


  ngOnDestroy() {
    this.cancelSub()
  }

  cancelSub() {
    if (this.orderSub) this.orderSub.unsubscribe()
    if (this.saldoSub) this.saldoSub.unsubscribe()
    if (this.new_orderSub) this.new_orderSub.unsubscribe()
    this.ubicacionService.clearInterval()
  }

}
