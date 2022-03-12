import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OperatorContactListComponent } from './component';

describe('OperatorContactListComponent', () => {
  let component: OperatorContactListComponent;
  let fixture: ComponentFixture<OperatorContactListComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperatorContactListComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorContactListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
