import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndGameDialogComponent } from './end-game-dialog.component';

describe('EndGameDialogComponent', () => {
  let component: EndGameDialogComponent;
  let fixture: ComponentFixture<EndGameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndGameDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndGameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
