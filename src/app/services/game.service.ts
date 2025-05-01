import { Injectable } from '@angular/core';
import { AppService } from './app.service';
import { BehaviorSubject } from 'rxjs';
import { CellDto } from '../models/cellDto';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  killer: boolean | undefined = undefined;
  difficulty: number | undefined = undefined;
  userId: string | undefined = undefined;
  sessionToken: string | undefined = undefined;

  fetchUrl: string = 'http://localhost:3000';

  constructor(private appService: AppService) {
    this.appService.killer.subscribe((bool) => {
      if (bool !== undefined) {
        this.killer = bool;
      }
    });
    this.appService.difficulty.subscribe((num) => {
      if (num != undefined) {
        this.difficulty = num;
      }
    });
    this.appService.userId.subscribe((string) => {
      if (string) {
        this.userId = string;
        this.getGame();
      }
    });
    this.appService.sessionToken.subscribe((string) => {
      if (string) {
        this.sessionToken = string;
        this.getGame();
      }
    });
    this.grid.subscribe(() => {
      if (this.checkIfGridComplete()) {
        this.gameFinished.next(true);
      }
    });
  }
  selectedCell = new BehaviorSubject<CellDto | undefined>(undefined);
  grid = new BehaviorSubject<Array<CellDto> | undefined>(
    this.createGridFromInputs(undefined)
  );
  killerGrid = new BehaviorSubject<Array<any> | undefined>(undefined);
  gameFinished = new BehaviorSubject<boolean>(false);
  errors = new BehaviorSubject<number>(0);
  score = new BehaviorSubject<number>(0);
  time = new BehaviorSubject<number>(0);

  async getGame(): Promise<void> {
    if (
      this.killer === undefined ||
      this.difficulty === undefined ||
      !this.userId ||
      !this.sessionToken
    )
      return;
    try {
      const res = await fetch(
        `${this.fetchUrl}/game?userId=${this.userId}&difficulty=${this.difficulty}&killer=${this.killer}`,
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${this.sessionToken}`,
          },
        }
      );
      const response = await res.json();
      this.grid.next(this.createGridFromInputs(response.inputs));
      this.errors.next(response.errors);
      this.score.next(response.score);
      this.clearCount();
      this.countFrom(response.time);
      if (response.killerGrid) {
        this.killerGrid.next(response.killerGrid);
      } else {
        this.killerGrid.next(undefined);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async createGame(killer: boolean, difficulty: number): Promise<void> {
    try {
      const res = await fetch(
        `${this.fetchUrl}/game/create?userId=${this.userId}&difficulty=${difficulty}&killer=${killer}`,
        {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${this.sessionToken}`,
          },
        }
      );
      const status = res.status;
      const response = await res.json();
      if (status === 200 && response.inputs) {
        this.grid.next(this.createGridFromInputs(response.inputs));
        this.errors.next(response.errors);
        this.score.next(response.score);
        this.redirect(killer, difficulty, false);
        this.clearCount();
        this.countFrom(response.time);
      }
    } catch (err) {
      console.log(err);
    }
  }

  createGridFromInputs(inputs: Array<CellDto> | undefined): Array<CellDto> {
    const grid: CellDto[] = [];

    for (let cellCol = 0; cellCol < 9; cellCol++) {
      for (let cellRow = 0; cellRow < 9; cellRow++) {
        const input = inputs?.find(
          (cell) => cell.cell[0] === cellCol && cell.cell[1] === cellRow
        );

        const cell = input
          ? input
          : {
              cell: [cellCol, cellRow],
              box: [Math.floor(cellCol / 3), Math.floor(cellRow / 3)],
              value: undefined,
              correct: undefined,
              isInitial: false,
            };
        grid.push(cell);
      }
    }

    return grid;
  }

  changeCellInGrid(cell: CellDto) {
    let grid = this.grid.getValue();

    if (grid === undefined) return;

    grid = grid.filter(
      (c) => c.cell[0] != cell.cell[0] || c.cell[1] != cell.cell[1]
    );

    grid.push(cell);

    this.grid.next(grid);
  }

  redirect(
    killer: boolean | undefined,
    difficulty: number | undefined,
    getGame: boolean
  ) {
    if (killer !== undefined) {
      localStorage.setItem('Killer', String(killer));
    }
    if (difficulty !== undefined) {
      localStorage.setItem('Difficulty', String(difficulty));
    }

    const currentKiller = localStorage.getItem('Killer') === 'true' || false;
    const currentDifficulty = Number(localStorage.getItem('Difficulty')) || 0;

    localStorage.setItem('Killer', String(currentKiller));
    localStorage.setItem('Difficulty', String(currentDifficulty));

    this.appService.killer.next(currentKiller);
    this.appService.difficulty.next(currentDifficulty);

    if (getGame === true) {
      this.getGame();
    }
  }

  async postCell(value: number | undefined): Promise<void> {
    const cell: CellDto | undefined = this.selectedCell.getValue();
    if (!cell) return;
    cell.value = value;
    try {
      const res = await fetch(
        `${this.fetchUrl}/game/cell?userId=${this.userId}&difficulty=${this.difficulty}&killer=${this.killer}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${this.sessionToken}`,
          },
          body: JSON.stringify({
            cell: cell,
          }),
        }
      );
      cell.correct = await res.json();
      this.changeCellInGrid(cell);

      if (cell.correct === true) {
        this.score.next(this.score.getValue() + 200);
      } else {
        this.errors.next(this.errors.getValue() + 1);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getIdea(): Promise<void> {
    const cell: CellDto | undefined = this.selectedCell.getValue();
    if (!cell) return;
    try {
      const res = await fetch(
        `${this.fetchUrl}/game/idea?userId=${this.userId}&difficulty=${this.difficulty}&killer=${this.killer}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${this.sessionToken}`,
          },
          body: JSON.stringify({
            cell: cell,
          }),
        }
      );
      const response = await res.json();
      this.changeCellInGrid(response);
    } catch (err) {
      console.log(err);
    }
  }

  changePostition(cell: CellDto) {
    this.selectedCell.next(cell);
  }

  changeMode() {
    console.log('change mode');
  }

  checkIfGridComplete(): boolean {
    const grid = this.grid.getValue();
    if (grid === undefined) return false;
    let i = 0;
    grid.forEach((cell) => {
      if (cell.correct) {
        i++;
      }
    });
    return i >= 81;
  }

  private intervalId: any;

  countFrom(num: number): void {
    let i = num;
    this.intervalId = setInterval(() => {
      this.time.next(i);
      this.postTime(i);
      i++;
    }, 1000);
  }

  clearCount(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async postTime(time: number) {
    try {
      const res = await fetch(
        `${this.fetchUrl}/game/time?userId=${this.userId}&difficulty=${this.difficulty}&killer=${this.killer}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${this.sessionToken}`,
          },
          body: JSON.stringify({
            time: time,
          }),
        }
      );
      // const response = await res.json();
      // // console.log(JSON.stringify(response));
    } catch (err) {
      console.log(err);
    }
  }
}
