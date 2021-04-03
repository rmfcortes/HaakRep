import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Address, Pedido } from 'src/app/interfaces/order.interface';

@Component({
  selector: 'app-card-negocio',
  templateUrl: './card-negocio.component.html',
  styleUrls: ['./card-negocio.component.scss'],
})
export class CardNegocioComponent implements OnInit {

  @Input() item: Pedido
  @Input() inOrder: boolean
  @Output() order = new EventEmitter<Pedido>(null)
  @Output() call = new EventEmitter<string>(null)
  @Output() map = new EventEmitter<Address>(null)

  constructor() { }

  ngOnInit() {}

  verMapa() {
    this.map.emit(this.item.address_negocio)
  }

  llamar(telefono: string) {
    this.call.emit(telefono)
  }

  verPedido() {
    this.order.emit(this.item)
  }

}
