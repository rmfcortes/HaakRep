import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CallNumber } from '@ionic-native/call-number/ngx';

import { ConfirmarPagoPage } from '../confirmar-pago/confirmar-pago.page';

import { UbicacionService } from 'src/app/services/ubicacion.service';
import { AnimationService } from 'src/app/services/animation.service';
import { OrdersService } from '../../services/orders.service';

import { Pedido } from 'src/app/interfaces/order.interface';


@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit, AfterViewInit {

  @Input() order: Pedido

  constructor(
    private callNumber: CallNumber,
    private modalCtrl: ModalController,
    private animationService: AnimationService,
    private ubicacionService: UbicacionService,
    private orderService: OrdersService,
  ) { }

  ngOnInit() {
    console.log(this.order);
  }

  ngAfterViewInit() {
    if (!this.order.repartidor_llego) {
      return this.createBtn('llegue_btn', 'caja_llegue', 'llegue')
    }
    if (this.order.recolectado) {
      this.createBtn('boton', 'caja', 'entrega')
    } else {
      this.createBtn('recoleccion_btn', 'caja_recoleccion', 'recoleccion')
    }
  }

  createBtn(idBtn: string, idCaja: string, origen: string) {
    const boton = document.getElementById(idBtn)
    const caja: HTMLElement = document.getElementById(idCaja)
    let cuenta
    if (this.order.formaPago === 'efectivo' && origen === 'entrega') {
      cuenta = document.getElementById('cuenta')
      this.animationService.pulse(cuenta)
    }
    let width_caja = 0
    setTimeout(() => {
      width_caja = caja.clientWidth - 55
      this.animationService.arrastra(boton, width_caja)
      .then(() => {
        switch (origen) {
          case 'llegue':
            this.llegada()
            break          
          case 'recoleccion':
            this.recolectar()
            break
          case 'entrega':
            this.entregar()
            break
        }
      })
    }, 300)
  }

  llegada() {
    this.order.repartidor_llego = true
    this.orderService.llegue(this.order)
    setTimeout(() => {
      this.createBtn('recoleccion_btn', 'caja_recoleccion', 'recoleccion')
    }, 500)
  }

  recolectar() {
    this.order.recolectado = true
    this.orderService.tengoProductos(this.order)
    setTimeout(() => {
      this.createBtn('boton', 'caja', 'entrega')
    }, 500)
  }

  navigate(address: string) {
    this.ubicacionService.navigate(address)
  }

  async entregar() {
    console.log(this.order);
    if (this.order.formaPago === 'efectivo') {
      const modal = await this.modalCtrl.create({
        component: ConfirmarPagoPage,
        componentProps: {total: this.order.total}
      })

      modal.onWillDismiss().then(resp => {
        if (resp) {
          this.orderService.finalizarPedido(this.order)
          this.order = null
          this.modalCtrl.dismiss(null, null, 'OrderPage')
        }
      })
      return await modal.present()
    } else {
      this.orderService.finalizarPedido(this.order)
      this.regresar()
      this.order = null
    }
  }

  llamar(numero) {
    this.callNumber.callNumber(numero, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.error(err))
  }

  regresar() {
    this.modalCtrl.dismiss()
    this.animationService.stopArrastra()
    this.animationService.stopPulse()
  }

}
