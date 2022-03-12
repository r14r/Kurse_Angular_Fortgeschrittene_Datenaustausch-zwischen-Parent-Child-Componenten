import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import * as _ from 'lodash';

import { CommunicationService, HelperService, LOGLEVEL } from '@app/shared';
import { OperatorEditorComponent } from './editor/component';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-operator-contact',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class OperatorComponent implements OnInit {
  public lineCount = 0;
  operatorEditorDialog: any = null;

  // Output to OperatorListComponent
  updateData: Subject<void> = new Subject<void>();

  helper: HelperService;

  constructor(private communicationService: CommunicationService, private dialog: MatDialog) {
    this.helper = new HelperService(LOGLEVEL.INFO, 'OperatorComponent');
  }

  ngOnInit() {
    // Using onSaveDoneCallback as callback for OperatorEditorComponent
    this.onSaveDoneCallback = this.onSaveDoneCallback.bind(this);
  }

  openEditorDialog() {
    this.helper.log(LOGLEVEL.INFO, 'openEditorDialog');

    this.operatorEditorDialog = this.dialog.open(OperatorEditorComponent, {
      disableClose: true,
      data: { mode: 'create', onSaveDoneCallback: this.onSaveDoneCallback },
    });

    this.operatorEditorDialog.afterClosed().subscribe((data: any) => {
      this.helper.debug(`openEditorDialog.afterClosed: data=`, data);

      if (data) {
        this.communicationService.setUpdateList();
      }
    });
  }

  updateSearchFilter(event: any): void {
    const searchText = event.target.value;
    if (searchText.length >= 3 || searchText.length === 0) {
      this.communicationService.setSearchText(searchText);
    }
  }

  /**
   * Callback from OperatorEditorComponent
   */
   onSaveDoneCallback() {
    this.helper.debug(`saveDone:`);
    this.updateData.next();
  }

  /**
   * Callback from ListComponent
   * @param count
   */
  onLineCountChange(count: number) {
    this.helper.debug(`onLineCountChange: count=${count}`);
    this.lineCount = count;
  }
}
