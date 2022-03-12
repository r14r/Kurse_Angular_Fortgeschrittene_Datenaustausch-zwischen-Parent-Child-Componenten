import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OperatorContactComponent } from './component';

describe('OperatorContactComponent', () => {
  let component: OperatorContactComponent;
  let fixture: ComponentFixture<OperatorContactComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperatorContactComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
