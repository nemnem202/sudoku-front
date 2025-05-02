import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../../services/game.service';
import { AppService } from '../../services/app.service';

export class timeDto {
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
}

@Component({
  selector: 'app-end-game-dialog',
  imports: [MatDialogModule, MatButtonModule, MatTabsModule, MatIconModule],
  templateUrl: './end-game-dialog.component.html',
  styleUrl: './end-game-dialog.component.scss',
})
export class EndGameDialogComponent implements OnInit {
  difficulties: Array<string> = ['Facile', 'Normal', 'Difficile', 'Extreme'];
  endErrors: number = 0;
  endScore: number = 0;
  endDifficulty: number = 0;
  endKiller: boolean = false;
  seconds: number = 0;
  minutes: number = 0;
  hours: number = 0;
  private gameService = inject(GameService);
  private appService = inject(AppService);

  constructor() {
    this.endErrors = this.gameService.errors.getValue();
    this.endScore = this.gameService.score.getValue();
    this.endDifficulty = this.gameService.difficulty || 0;
    this.endKiller = this.gameService.killer || false;
    const time = this.formatTime(this.gameService.time.getValue());
    this.seconds = time.seconds;
    this.minutes = time.minutes;
    this.hours = time.hours;

    // this.gameService.errors.subscribe((num) => {
    //   this.endErrors = num;
    // });
    // this.gameService.score.subscribe((num) => {
    //   this.endScore = num;
    // });
    // this.appService.killer.subscribe((bool: boolean | undefined) => {
    //   if (bool != undefined) {
    //     this.endKiller = bool;
    //   }
    // });
    // this.appService.difficulty.subscribe((num: number | undefined) => {
    //   if (num != undefined) {
    //     this.endDifficulty = num;
    //   }
    // });
  }

  ngOnInit() {
    this.gameService.clearCount();
    this.gameService.createGame(
      this.gameService.killer || false,
      this.gameService.difficulty || 0
    );
  }

  async setDifficulty(diff: number) {
    this.gameService.redirect(undefined, diff, true);
  }

  setMode(killer: boolean) {
    this.appService.killer.next(killer);
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
