import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator/ngx';

import { AngularFirestore } from '@angular/fire/firestore';

import { UserService } from './user.service';

import { Ubicacion } from '../interfaces/usert.interface';
import { AddressUser } from '../interfaces/order.interface';



@Injectable({
  providedIn: 'root'
})
export class UbicacionService {

  public ubicacion = new BehaviorSubject<Ubicacion>({
    lat: 22.571956,
    lng: -102.253399
  })

  currentLocation: Ubicacion = {
    lat: 22.571956,
    lng: -102.253399
  }

  trackInterval: any
  intervalo = 1000 * 10

  options: GeolocationOptions = {
    enableHighAccuracy: true,
  }

  lastLoc = {
    lat: null,
    lng: null
  }

  constructor(
    private ngZone: NgZone,
    private af: AngularFirestore,
    public geolocation: Geolocation,
    private launchNavigator: LaunchNavigator,
    private uidService: UserService,
  ) { }

   // Track position
  getPosition(): Promise<Geoposition> {
    return new Promise((resolve, reject) => {      
      this.geolocation.getCurrentPosition(this.options)
      .then((position: Geoposition) => {
        this.ngZone.run(() => resolve(position))
      })
      .catch(err => {
        reject(err)
        alert(err)
      })
    })
  }

  setInterval() {
    this.trackInterval = setInterval(() => {
      this.getPosition()
      .then(position => this.comparaLoc(position))
    }, this.intervalo)
  }

  clearInterval() {
    clearInterval(this.trackInterval)
    this.trackInterval = null
  }

  // Compara si no es una ubicación erronea

  async comparaLoc(position: Geoposition) {
    if (position.coords.accuracy > 25) return
    if (!this.lastLoc.lat || !this.lastLoc.lng) {
      this.lastLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      this.updateLocation(position)
    } else {
      const d = await this.calculaDistancia(
        this.lastLoc.lat,
        this.lastLoc.lng,
        position.coords.latitude,
        position.coords.longitude,
      )
      if (d < 5) return
      else {
        this.lastLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.updateLocation(position)
      }
    }
  }

  // Suba ubicación a base de datos

  async updateLocation(data: Geoposition) {
    const coords = {
      lat: data.coords.latitude,
      lng: data.coords.longitude,
    };
    this.ubicacion.next(coords)
    this.currentLocation.lat = coords.lat
    this.currentLocation.lng = coords.lng
    const idRepartidor = this.uidService.getUid()
    this.af.doc(`locations/${idRepartidor}`).set(coords)
  }

  // Auxiliar

  calculaDistancia( lat1, lng1, lat2, lng2 ): Promise<number> {
    return new Promise ((resolve, reject) => {
      const R = 6371 // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1)  // this.deg2rad below
      const dLon = this.deg2rad(lng2 - lng1)
      const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const d = R * c * 1000 // Distance in mts
      resolve(d)
    })
  }

  deg2rad( deg ) {
    return deg * (Math.PI / 180)
  }

  // Navigate
  async navigate(destino: AddressUser) {
    const position = await this.getPosition()
    let options: LaunchNavigatorOptions = {
      start: [position.coords.latitude, position.coords.longitude],
      app: this.launchNavigator.APP.WAZE
    }

    this.launchNavigator.navigate(destino.direccion, options)
  }


}
