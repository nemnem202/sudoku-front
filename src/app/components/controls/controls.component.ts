import { Component, inject, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { formatCurrency, NgFor } from '@angular/common';
import { NewGameDialogComponent } from '../new-game-dialog/new-game-dialog.component';

export class timeDto {
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
}

@Component({
  selector: 'app-controls',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatBadgeModule,
    NgFor,
  ],
  templateUrl: './controls.component.html',
  styleUrl: './controls.component.scss',
})
export class ControlsComponent implements OnInit {
  seconds: number = 0;
  minutes: number = 0;
  hours: number = 0;
  score: number = 0;
  errors: number = 0;

  gameService = inject(GameService);
  dialog = inject(MatDialog);

  constructor() {
    this.gameService.errors.subscribe((num) => {
      this.errors = num;
    });
    this.gameService.score.subscribe((num) => {
      this.score = num;
    });
    this.gameService.time.subscribe((num) => {
      const time = this.formatTime(num);
      this.seconds = time.seconds;
      this.minutes = time.minutes;
      this.hours = time.hours;
    });
  }

  ngOnInit() {
    window.addEventListener('keydown', (event) => {
      if (Number(event.key) && Number(event.key) > 0) {
        this.updateCellValue(Number(event.key));
      }
      if (event.key === 'Delete') {
        this.updateCellValue(undefined);
      }
      if (event.key === 'i') {
        this.ideaClick();
      }
    });
  }

  eraseClick() {
    this.gameService.postCell(undefined);
  }

  ideaClick() {
    this.gameService.getIdea();
  }

  updateCellValue(value: number | undefined) {
    this.gameService.postCell(value);
  }

  openDialog() {
    this.dialog.open(NewGameDialogComponent);
  }

  formatTime(seconds: number): timeDto {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h,
      minutes: m,
      seconds: s,
    };
  }
}
