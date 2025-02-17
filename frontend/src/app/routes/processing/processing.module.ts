import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorManagerModule } from 'src/app/util/error-manager/error-manager.module';
import { ProcessingComponent } from './processing.component';
import { ProcessingRoutingModule } from './processing.routing.module';

@NgModule({
  declarations: [ProcessingComponent],
  imports: [
    CommonModule,
    ErrorManagerModule,
    ProcessingRoutingModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
  ],
})
export default class ProcessingRouteModule {}
