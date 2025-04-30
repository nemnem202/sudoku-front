import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { GameService } from '../../services/game.service';
import { AppService } from '../../services/app.service';
@Component({
  selector: 'app-new-game-dialog',
  imports: [MatDialogModule, MatButtonModule, MatTabsModule, MatIconModule],
  templateUrl: './new-game-dialog.component.html',
  styleUrl: './new-game-dialog.component.scss',
})
export class NewGameDialogComponent {
  modes: Array<string> = ['Classic', 'Killer'];
  modeIndex: number = 0;
  killer: boolean = false;
  // difficulty: number = 0;
  private appService = inject(AppService);
  private gameService = inject(GameService);

  constructor() {
    this.appService.killer.subscribe((bool: boolean | undefined) => {
      if (bool != undefined) {
        this.killer = bool;
      }
    });
    // this.appService.difficulty.subscribe((num: number | undefined) => {
    //   if (num != undefined) {
    //     this.difficulty = num;
    //   }
    // });
  }
  async setDifficulty(difficulty: number) {
    await this.gameService.createGame(this.killer, difficulty);
    this.gameService.redirect(undefined, undefined);
  }

  setMode(killer: boolean) {
    this.appService.killer.next(killer);
  }
}
