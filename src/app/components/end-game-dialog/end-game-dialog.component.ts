import { Component, inject, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../../services/game.service';
import { AppService } from '../../services/app.service';
@Component({
  selector: 'app-end-game-dialog',
  imports: [MatDialogModule, MatButtonModule, MatTabsModule, MatIconModule],
  templateUrl: './end-game-dialog.component.html',
  styleUrl: './end-game-dialog.component.scss',
})
export class EndGameDialogComponent {
  difficulties: Array<string> = ['Facile', 'Normal', 'Difficile', 'Extreme'];
  endErrors: number = 0;
  endScore: number = 0;
  endDifficulty: number = 0;
  endKiller: boolean = false;
  private gameService = inject(GameService);
  private appService = inject(AppService);

  constructor() {
    this.gameService.errors.subscribe((num) => {
      this.endErrors = num;
    });
    this.gameService.score.subscribe((num) => {
      this.endScore = num;
    });
    this.appService.killer.subscribe((bool: boolean | undefined) => {
      if (bool != undefined) {
        this.endKiller = bool;
      }
    });
    this.appService.difficulty.subscribe((num: number | undefined) => {
      if (num != undefined) {
        this.endDifficulty = num;
      }
    });
  }

  async setDifficulty(diff: number) {
    this.gameService.redirect(undefined, diff);
  }

  setMode(killer: boolean) {
    this.appService.killer.next(killer);
  }
}
