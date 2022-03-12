import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OperatorContactEditorComponent } from './component';

describe('OperatorContactEditorComponent', () => {
  let component: OperatorContactEditorComponent;
  let fixture: ComponentFixture<OperatorContactEditorComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [OperatorContactEditorComponent],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorContactEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
