import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Pedido } from '../interfaces/order.interface';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UserService,
  ) { }

  getHistorial(fechaInicial: string, fechaFinal: string): Promise<Pedido[]> {
    return new Promise((resolve, reject) => {
      const uid = this.uidService.getUid()
      const hisSub = this.db.list(`pedidos_completados/${uid}`, h => h.orderByKey().startAt(fechaInicial).endAt(fechaFinal))
      .valueChanges().subscribe(registros => {
        hisSub.unsubscribe()
        let historial: Pedido[] = []
        registros.forEach(o => historial = [...historial, ...Object.values(o)])
        console.log(historial);
        resolve(historial)
      })
    })

  }

  formatDate(date): Promise<string> {
    return new Promise((resolve, reject) => {        
        let month = '' + (date.getMonth() + 1)
        let day = '' + date.getDate()
        const year = date.getFullYear()
    
        if (month.length < 2) month = '0' + month
        if (day.length < 2) day = '0' + day
    
        resolve([year, month, day].join('-'))
    })
  }

}
