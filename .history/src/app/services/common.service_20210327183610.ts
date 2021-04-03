import { Injectable } from '@angular/core';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { Pedido } from '../interfaces/order.interface';


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  loader: any
  order: Pedido

  constructor(
    private storage: Storage,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
  ) { }

  setOrderTemporal(order: Pedido) {
    this.order = order
  }

  // Storage

  getVariableFromStorage(variable: string): Promise<string> {
    return new Promise (async (resolve, reject) => {
      if ( this.platform.is('cordova') ) {
        // Celular
        this.storage.ready().then(async () => {
          const value = this.storage.get(variable)
          resolve(value)
        })
      } else {
        // Escritorio
        const value = localStorage.getItem(variable)
        resolve(value)
      }
    })
  }

  setVariableToStorage(name: string, value: string): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      if (this.platform.is ('cordova')) {
        this.storage.set(name, value)
        resolve(true)
      } else {
        localStorage.setItem(name, value)
        resolve(true)
      }
    })
  }

  removeFromStorage(name: string) {
    if ( this.platform.is('cordova') ) {
      this.storage.remove(name)
    } else {
      localStorage.removeItem(name)
    }
  }

  // Alerts

  async presentLoading() {
    this.loader = await this.loadingCtrl.create({
     spinner: 'crescent'
    })
    return await this.loader.present()
  }

  dismissLoading() {
    this.loader.dismiss()
  }

  async presentAlert(titulo, msn, btn) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msn,
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          cssClass: 'secondary',
        }
      ]
    })

    await alert.present()
  }

  async presentToast(mensaje) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    })
    toast.present()
  }

}
