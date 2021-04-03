import { Component, OnInit, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { HistorialService } from 'src/app/services/historial.service';
import { CommonService } from '../../services/common.service';
import { Pedido } from '../../interfaces/order.interface';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  @ViewChild('startDate', {static: false}) starDate: IonDatetime
  @ViewChild('endDate', {static: false}) endDate: IonDatetime

  historial: Pedido[] = []

  hoy = new Date()
  hoyString

  fechaInicial: string
  fechaFinal: string

  monthNames = 'Ene, Feb, Mar, Abr, May, Jun, Jul, Ago, Sep, Oct, Nov, Dic'

  ganancia = 0
  efectivo_cobrado = 0

  loading = false

  constructor(private alertService: CommonService, private historialService: HistorialService) { }

  async ngOnInit() {
    this.hoyString = this.hoy.toISOString()
    this.fechaInicial =this.hoy.toISOString().split('T')[0]
    this.fechaFinal =this.hoy.toISOString().split('T')[0]
  }

  async startChange(fecha: string) {
    fecha = fecha.split('T')[0]
    if (this.fechaFinal) {
      if (fecha > this.fechaFinal) {
        this.alertService.presentAlert('Error', 'La fecha inicial no puede ser mayor a la fecha final', 'Entendido')
        this.starDate.value = this.fechaInicial + 'T17:00:00.450Z'
        return 
      }else this.fechaInicial = fecha
    } else this.fechaInicial = fecha
  }

  async endChange(fecha) {
    fecha = await this.historialService.formatDate(new Date(fecha))
    if (this.fechaInicial) {
      if (this.fechaInicial > fecha) {
        this.alertService.presentAlert('Error', 'La fecha inicial no puede ser mayor a la fecha final', 'Entendido')
        this.endDate.value = this.fechaFinal + 'T17:00:00.450Z'
        return 
      } else this.fechaFinal = fecha
    }
    else this.fechaFinal = fecha
  }

  verRegistros() {
    this.ganancia = 0
    this.efectivo_cobrado = 0
    this.loading = true
    this.historialService.getHistorial(this.fechaInicial, this.fechaFinal)
    .then(historial => {
      this.historial = historial
      this.historial.forEach(h => {
        this.ganancia += h.ganancia
        if (h.formaPago === 'efectivo') this.efectivo_cobrado += h.total
      })
      this.loading = false
    })
    .catch(err => console.log(err))
  }


}
