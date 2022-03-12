import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '@app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@app/shared';

import { OperatorContactRoutingModule } from './routing.module';
import { OperatorComponent } from './component';
import { OperatorListComponent } from './list/component';
import { OperatorEditorComponent } from './editor/component';

@NgModule({
  declarations: [OperatorComponent, OperatorListComponent, OperatorEditorComponent],
  imports: [
    CommonModule,
    OperatorContactRoutingModule,
    TranslateModule,
    FlexLayoutModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  entryComponents: [OperatorEditorComponent],
})
export class OperatorContactModule {}
