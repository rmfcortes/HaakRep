import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { Address, Order, Pedido } from 'src/app/interfaces/order.interface';



@Component({
  selector: 'app-card-cliente',
  templateUrl: './card-cliente.component.html',
  styleUrls: ['./card-cliente.component.scss'],
})
export class CardClienteComponent implements OnInit {

  @Input() item: Pedido
  @Input() inOrder: boolean
  @Output() order = new EventEmitter<Pedido>(null)
  @Output() call = new EventEmitter<string>(null)
  @Output() map = new EventEmitter<Address>(null)

  constructor() { }

  ngOnInit() {}

  verMapa() {
    this.map.emit(this.item.address_user)
  }

  llamar() {
    this.call.emit(this.item.phone_number_user)
  }

  verPedido() {
    this.order.emit(this.item)
  }

}
