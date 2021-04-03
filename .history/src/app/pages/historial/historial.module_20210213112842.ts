import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsMX from '@angular/common/locales/es-MX';
registerLocaleData(localeEsMX, 'es-MX');

import { HistorialPageRoutingModule } from './historial-routing.module';

import { HistorialPage } from './historial.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HistorialPageRoutingModule
  ],
  declarations: [HistorialPage],
  providers: [{provide: LOCALE_ID, useValue: "es-MX"}]
})
export class HistorialPageModule {}
