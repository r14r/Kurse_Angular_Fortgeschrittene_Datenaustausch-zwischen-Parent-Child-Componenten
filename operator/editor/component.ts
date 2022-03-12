import { Component, OnInit, OnDestroy, Inject, AfterContentInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';

import { OperatorService, SiteService, Operator, Site, getSaveTooltipMsg } from '@app/shared';

import { HelperService, LOGLEVEL } from '@app/shared/helper/helper.service';

@Component({
  selector: 'app-operator-contact-editor',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class OperatorEditorComponent implements OnInit, OnDestroy, AfterContentInit {
  mode: string = null;
  operator: Operator = null;
  selectedIndex = 0;
  siteList: Site[];

  // prettier-ignore
  PHONE_NUMBER_REGEX = '[- +()0-9]{6,}'
  OLD =
    '(' +
    '(' +
    '[+]' +
    '[(]?' +
    '[0-9]{1,3}' +
    '[)]?' +
    ')' +
    '|' +
    '(' +
    '[(]?' +
    '[0-9]{4}' +
    '[)]?' +
    ')' +
    ')' +
    's*' +
    '[-s.]?' +
    '[(]?' +
    '[0-9]{1,3}' +
    '[)]?' +
    '(' +
    '[-s.]?' +
    '[0-9]{3}' +
    ')' +
    '(' +
    '[-s.]?' +
    '[0-9]{3,4}' +
    ')';

  saveTooltipMsg = getSaveTooltipMsg;

  public formGroup: FormGroup;
  private ngUnsubscribe = new Subject<void>();

  private onSaveDoneCallback: any = null;

  /**
   *
   */
  private helper: HelperService;

  constructor(
    private dialogRef: MatDialogRef<OperatorEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private operatorService: OperatorService,
    private siteService: SiteService,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {
    this.helper = new HelperService(LOGLEVEL.INFO, 'OperatorEditorComponent');

    this.formGroup = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(this.PHONE_NUMBER_REGEX)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      info: new FormControl('', []),
      assignedSites: new FormControl(''),
    });
  }

  /**
   *
   */
  ngOnInit() {
    this.mode = _.get(this.data, 'mode', 'create');
    this.operator = _.get(this.data, 'operator', {});

    this.onSaveDoneCallback = _.get(this.data, 'onSaveDoneCallback', null);

    this.helper.log(
      LOGLEVEL.DEBUG,
      `ngOnInit: mode=${this.mode} operator=${this.operator.lastName}/${this.operator.firstName}`,
      this.operator
    );
    // Init SiteList
    this.siteService.getList().subscribe((result) => {
      this.siteList = result.documents;
    });

    //
    // this.initFormChanges();
  }

  ngAfterContentInit() {
    this.helper.log(LOGLEVEL.DEBUG, 'ngAfterContentInit');

    this.formGroup.controls.firstName.setValue(this.operator.firstName);
    this.formGroup.controls.lastName.setValue(this.operator.lastName);
    this.formGroup.controls.phoneNumber.setValue(this.operator.phoneNumber);
    this.formGroup.controls.email.setValue(this.operator.email);
    this.formGroup.controls.info.setValue(this.operator.info);
    this.formGroup.controls.assignedSites.setValue(this.operator.assignedSites);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  initFormChanges(): void {
    this.formGroup.valueChanges.subscribe((val) => {
      this.onChangeFormValues(val);
    });
  }

  findInvalidControls() {
    const invalid = [];
    const controls = this.formGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  onChangeFormValues(val: unknown): void {
    this.helper.log(LOGLEVEL.DEBUG, `onChangeFormValues: val=`, val);
    this.helper.log(LOGLEVEL.DEBUG, `onChangeFormValues: invalid controls=`, this.findInvalidControls());
  }

  doClose() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  /**
   *
   */
  doSave(): void {
    let operator: Operator;
    operator = _.merge(this.operator, this.formGroup.value);

    this.dialogRef.close({ event: 'Save', data: operator });

    this.helper.log(LOGLEVEL.DEBUG, `doSave: operator=`, operator);

    this.operatorService.save(operator).subscribe((result) => {
      this.helper.log(LOGLEVEL.DEBUG, `doSave: subscribe result=`, result);

      if (this.onSaveDoneCallback) {
        this.helper.log(LOGLEVEL.DEBUG, `doSave: onSaveDoneCallback()`);
        this.onSaveDoneCallback();
        this.helper.log(LOGLEVEL.DEBUG, `doSave: onSaveDoneCallback() DONE`);
      }

      this.translateService.get('operatorEditor.saved').subscribe(
        (msg) => {
          this.toastr.success(msg);
        },
        (error) => {
          this.translateService.get('editor.error').subscribe((msg) => {
            this.toastr.error(msg);
          });
        }
      );

      this.helper.log(LOGLEVEL.DEBUG, `doSave: DONE`);
    });
  }

  onChangeSelectedSite(event: any) {
    this.helper.debug(`onChangeSelectedSite; event=`, event);
  }
}
