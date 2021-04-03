import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderPage } from './order.page';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { CardModule } from 'src/app/shared/card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CardModule,
  ],
  declarations: [OrderPage],
  providers: [CallNumber],

})
export class OrderPageModule {}
