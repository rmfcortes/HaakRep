import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';

import { UserService } from 'src/app/services/user.service';

import { Repartidor } from '../interfaces/usert.interface';
import { Order } from '../interfaces/order.interface';
import { AudioService } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  new_order = new BehaviorSubject<Order>(null)

  constructor(
    private af: AngularFirestore,
    private db: AngularFireDatabase,
    private audioService: AudioService,
    private uidService: UserService,
  ) { }

  getOrders() {
    const idRepartidor = this.uidService.getUid()
    return this.db.list(`asignados/${idRepartidor}`).valueChanges()
  }

  getSaldo() {
    const idRepartidor = this.uidService.getUid()
    return this.db.object(`saldo/${idRepartidor}/actual`).valueChanges()
  }

  async aceptOrder(order: Order) {
    const idRepartidor = this.uidService.getUid()
    const repartidor: Repartidor =  {
      id: idRepartidor,
      nombre: this.uidService.getNombre()
    }
    order.repartidor = repartidor
    order.status = 'Repartidor asginado'
    this.db.object(`asignados/${idRepartidor}/${order.id_order}`).set(order)
    // this.af.doc(`pedidos/${order.id_negocio}/by_id/${order.id_order}`).update(order)
    // this.af.doc(`pedidos_user/${order.id_user}/by_nano/${order.id_nano}`).update(order)
    // this.audioService.silenciar()
  }

  async newOrder(notification: Order) {
    this.audioService.silenciar()
    this.new_order.next(notification)
    this.audioService.playAlert()
  }

  cleanPedidoSub() {
    this.new_order.next(null)
  }

  async llegue(order: Order) {
    const idRepartidor = this.uidService.getUid()
    order.status = 'Repartidor en espera de los productos'
    this.db.object(`asignados/${idRepartidor}/${order.id_order}`).update(order)
    // this.af.doc(`pedidos/${order.id_negocio}/by_id/${order.id_order}`).update(order)
    // this.af.doc(`pedidos_user/${order.id_user}/by_nano/${order.id_nano}`).update(order)
  }

  async tengoProductos(order: Order) {
    // status: 3
    const idRepartidor = this.uidService.getUid()
    order.status = 'Repartidor en camino a tu dirección'
    this.db.object(`asignados/${idRepartidor}/${order.id_order}`).update(order)
    // this.af.doc(`pedidos/${order.id_negocio}/by_id/${order.id_order}`).update(order)
    // this.af.doc(`pedidos_user/${order.id_user}/by_nano/${order.id_nano}`).update(order)
  }

  async finalizarPedido(order: Order) {
    // status 4
    const idRepartidor = this.uidService.getUid()
    const fecha = await this.formatDate()
    this.db.object(`asignados/${idRepartidor}/${order.id_order}`).remove()
    // Poner en historial
    this.db.object(`pedidos_completados/${idRepartidor}/${fecha}/${order.id_order}`).update(order)
    const transaccion = {
      id_order: order.id_order,
      total: order.total,
      saldo: order.total - order.ganancia,
      negocio_name: order.negocio_name,
      ganancia: order.ganancia,
      tipo: ''
    }
    if (order.formaPago === 'efectivo') {
      transaccion.tipo = 'deuda'
      this.db.object(`saldo/${idRepartidor}/transacciones/${order.id_order}`).update(transaccion)
      this.db.object(`saldo/${idRepartidor}/actual`).query.ref.transaction(a => a ? a - transaccion.saldo : -transaccion.saldo)
    } else {
      transaccion.tipo = 'ganancia'
      this.db.object(`saldo/${idRepartidor}/transacciones/${order.id_order}`).update(transaccion)
      this.db.object(`saldo/${idRepartidor}/actual`).query.ref.transaction(a => a ? a + transaccion.saldo : transaccion.saldo)
    }
  }

  testOrder() {
    const newOrder: Order = {
      address_negocio: {direccion: 'Av Siempre Viva 4545', lat: 0, lng: 0},
      address_user: {direccion: 'Direccion Usuario 4563', lat: 0, lng: 0},
      createdAt: 12354531,
      ganancia: 25,
      id_nano: 'ASX453',
      id_negocio: 'aserew',
      id_order: 'jdsklfjakls',
      id_user: 'safjwñeklraew',
      negocio_name: 'Pollo San Juan',
      phone_number_negocio: '3355555566',
      phone_number_user: '11112222333',
      status: 'En espera de repartidor',
      total: 153,
      user_name: 'Pablo',
      formaPago: 'efectivo'
    }
    this.new_order.next(newOrder)  
  }

  formatDate(): Promise<string> {
    return new Promise((resolve, reject) => {        
        const d = new Date()
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        const year = d.getFullYear()
    
        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day
    
        resolve([year, month, day].join('-'))
    })
  }




}
