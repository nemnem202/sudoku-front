import { Component, inject } from '@angular/core';
import { AppService } from '../../services/app.service';
import { GameService } from '../../services/game.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-difficulty',
  imports: [MatMenuModule, MatButtonModule, MatIconModule],
  templateUrl: './difficulty.component.html',
  styleUrl: './difficulty.component.scss',
})
export class DifficultyComponent {
  difficulty: number = 0;
  gameService = inject(GameService);
  difficultyArray: Array<string> = ['Facile', 'Normal', 'Difficile', 'Extreme'];
  constructor(appService: AppService) {
    appService.difficulty.subscribe((diff) => {
      if (diff != undefined) {
        this.difficulty = diff;
      }
    });
  }
  changeDifficulty(index: number) {
    this.gameService.redirect(undefined, index);
  }
}
