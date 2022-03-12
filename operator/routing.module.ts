import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { OperatorComponent } from './component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  { path: '', component: OperatorComponent, data: { title: extract('Operator') } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OperatorContactRoutingModule {}
