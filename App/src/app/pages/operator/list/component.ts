import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { switchMap, tap, takeUntil } from 'rxjs/operators';
import { merge, Subject, combineLatest, Subscription, Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';

import {
  OperatorService,
  CommunicationService,
  Operator,
  Actions,
  HelperService,
  LOGLEVEL,
  Site,
  SiteService,
} from '@app/shared';
import { OperatorEditorComponent } from '../editor/component';
import { ConfirmationDialogComponent } from '@app/shared/components/confirmation-dialog/component';

@Component({
  selector: 'app-operator-contact-list',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class OperatorListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['firstName', 'lastName', 'phoneNumber', 'email', 'sites', 'actions'];
  dataSource = new MatTableDataSource([]);
  allDataSource: Operator[];
  operatorEditorDialog: any = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public pagesize = 10;
  public lineCount = 0;
  
  // Get Information from Parent to Update the Data
  private updatDataSubscription: Subscription;
  @Input() updateData: Observable<void>;

  // Send back number of lines
  @Output() lineCountChange = new EventEmitter();
  @Output() dataChanged = new EventEmitter();

  siteList: Site[];

  private initTable = new EventEmitter<boolean>();
  private initPaginator = new EventEmitter<boolean>();

  private ngUnsubscribe = new Subject<void>();

  helper: HelperService;

  constructor(
    private operatorService: OperatorService,
    private communicationService: CommunicationService,
    private siteService: SiteService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this.helper = new HelperService(LOGLEVEL.INFO, 'OperatorListComponent');
  }

  ngOnInit(): void {
    this.dataSource.sort = this.sort;
    this.retrieveSiteList();
    this.retrieveNewData();
    this.retrieveSubData();

    this.initTable.emit(true);

    this.updatDataSubscription = this.updateData.subscribe(() => this.doUpdateData());

    this.onSaveDoneCallback = this.onSaveDoneCallback.bind(this);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.communicationService.setSearchText(null);

    this.updatDataSubscription.unsubscribe();
  }
  
  retrieveSiteList() {
    this.siteService.getList().subscribe((res) => {
      this.siteList = res.documents;

      this.helper.log(LOGLEVEL.DEBUG, 'retrieveSiteList: siteList = ', this.siteList);
    });
  }

  retrieveNewData(): void {
    this.helper.log(LOGLEVEL.DEBUG, 'retrieveNewData:');

    combineLatest([this.communicationService.searchText, this.initTable, this.communicationService.updateList])
      .pipe(
        tap(() => {
          // this.helper.log(LOGLEVEL.DEBUG, 'retrieveNewData: combineLatest');
        }),
        switchMap(() => {
          // this.helper.log(LOGLEVEL.DEBUG, 'retrieveNewData: loadData');
          return this.loadData(this.communicationService.searchText.value);
        }),
        tap((data: any) => {
          this.helper.log(LOGLEVEL.DEBUG, 'retrieveNewData: data=', data);

          // TODO: remove this
          this.allDataSource = data.documents;
          this.lineCount = data.documents.length;
          this.lineCountChange.emit(this.lineCount);
          // this.dataChanged.emit(true);
          if (this.paginator.pageIndex !== 0) {
            this.paginator.firstPage();
          } else {
            this.initPaginator.emit(true);
          }
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((data) => {
        // this.helper.log(LOGLEVEL.DEBUG, 'retrieveNewData: combineLatest DONE data=', data);
      });
  }

  retrieveSubData(): void {
    this.helper.log(LOGLEVEL.DEBUG, 'retrieveSubData:');

    merge(this.paginator.page, this.initPaginator)
      .pipe(
        tap(() => {
          const pagesize = this.paginator.pageSize ? this.paginator.pageSize : this.pagesize;
          const offset = this.paginator.pageIndex * pagesize;
          this.dataSource.data = this.allDataSource.slice(offset, offset + pagesize);
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((data) => {
        // this.helper.log(LOGLEVEL.DEBUG, 'retrieveSubData: merge DONE data=', data);
      });
  }

  loadData(searchText: string = '') {
    this.helper.debug(`loadData: call operatorService.list`);
    const data = this.operatorService.list({ q: searchText });
    this.helper.debug(`loadData: searchText=${searchText} data=`, data);

    return data;
  }

  /**
   *
   * @param row
   */
  delete(row: Operator) {
    const oldPage = this.paginator.pageIndex;
    this.operatorService
      .delete(row.id)
      .pipe(
        tap(
          (res) => {
            this.translateService.get('operator.deletedSuccessfully').subscribe((msg) => {
              this.toastr.success(msg);
            });
            this.communicationService.setUpdateList();
          },
          (error) => {
            this.translateService.get('operator.deletedFailed').subscribe((msg) => {
              this.toastr.error(msg);
            });
          }
        )
      )
      .subscribe();
  }

  openEditorDialog(row: any) {
    this.helper.log(LOGLEVEL.INFO, 'openEditorDialog: row=', row);

    this.operatorEditorDialog = this.dialog.open(OperatorEditorComponent, {
      disableClose: true,
      data: {
        mode: 'edit',
        operator: _.cloneDeep(row),
        onSaveDoneCallback: this.onSaveDoneCallback
      },
    });

    this.operatorEditorDialog.afterClosed().subscribe((data: any) => {
      this.helper.debug(`openEditorDialog.afterClosed: data=`, data);

      if (data /* && data.operator */) {
        this.helper.debug(`openEditorDialog.afterClosed: initTable`);
        this.initTable.next(true);
        // this.retrieveNewData()
      }
    });
  }

  openDeleteDialog(operator: Operator): void {
    const msg = this.translateService.instant('confirmDeleteOperator');
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '450px',
      data: { question: msg, details: operator.firstName + ' ' + operator.lastName },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete(operator);
      }
    });
  }

  getActionList(element: Operator): Actions {
    return {
      row: element,
      actionList: [
        {
          tooltipText: 'action.edit',
          callBack: (e: any) => this.openEditorDialog(e),
          iconCode: 'edit',
          isVisible: true,
        },
        {
          tooltipText: 'action.delete',
          callBack: (e: any) => this.openDeleteDialog(e),
          iconCode: 'delete',
          isVisible: true,
        },
      ],
      maxToDisplay: 2,
    };
  }

  onSaveDoneCallback() {
    this.helper.debug(`onSaveDoneCallback:`);
    this.doUpdateData();
  }

  // 
  doUpdateData() {
    this.helper.debug(`doUpdateData:`);
    this.initTable.emit(true);
  }

  rowClicked(row: any) {
    this.helper.debug(`rowClicked: row=`, row);
  }

  getTooltip(assignedSites: any) {
    const siteNames = this.siteList.filter((site) => assignedSites.includes(site.id)).map((site) => site.name);

    return siteNames.join(' / ');
  }
}
