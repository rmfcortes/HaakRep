import { Injectable } from '@angular/core';

import { NativeAudio } from '@ionic-native/native-audio/ngx';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(
    private audio: NativeAudio,
  ) { }

  initAudio(): Promise<boolean>{
    return new Promise(async (resolve, reject) => {      
      this.audio.preloadSimple('alerta', 'assets/sounds/loving-you.mp3')
      resolve(true)
    })
  }

  playAlert() {
    this.audio.play('alerta')
  }

  silenciar() {
    this.audio.stop('alerta')
  }

}
