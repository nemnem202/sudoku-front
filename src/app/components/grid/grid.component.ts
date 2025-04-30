import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AppService } from '../../services/app.service';
import { GameService } from '../../services/game.service';
import { NgClass, NgForOf } from '@angular/common';
import { CellDto } from '../../models/cellDto';
import { MatDialog } from '@angular/material/dialog';
import { EndGameDialogComponent } from '../end-game-dialog/end-game-dialog.component';

@Component({
  selector: 'app-grid',
  imports: [NgClass, NgForOf],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
})
export class GridComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) gridCanvas!: ElementRef;
  @ViewChild('gridContainer', { static: true }) gridContainer!: ElementRef;
  private gameService = inject(GameService);
  private dialog = inject(MatDialog);
  selectedCell: CellDto | undefined = undefined;
  grid: Array<CellDto> | undefined = undefined;
  killerGrid: Array<any> | undefined = undefined;

  constructor() {
    this.gameService.selectedCell.subscribe((cell) => {
      this.selectedCell = cell;
    });
    this.gameService.grid.subscribe((grid) => {
      this.grid = grid;
    });
    this.gameService.killerGrid.subscribe((grid) => {
      this.killerGrid = grid;
      this.updateCanvasSize();
      this.drawCanvas();
      this.drawKillerGridCanvas();
    });
    this.gameService.gameFinished.subscribe((bool) => {
      if (bool) {
        this.repeatFinishAnimation(3, () => {
          this.openDialog();
        });
      }
    });
  }

  ngAfterViewInit() {
    this.updateCanvasSize();
    this.drawCanvas();
    this.drawKillerGridCanvas();
  }

  toColorIn(cell: CellDto): string {
    if (this.selectedCell === undefined) return '';
    const selCell = this.selectedCell;
    const isSameCell =
      cell.cell[0] === selCell.cell[0] && cell.cell[1] === selCell.cell[1];
    const isSameValue = selCell.value && cell.value === selCell.value;
    if (isSameCell || isSameValue) return 'primary';

    const isSameBox =
      cell.box[0] === selCell.box[0] && cell.box[1] === selCell.box[1];
    const isSameColumn = cell.cell[0] === selCell.cell[0];
    const isSameRow = cell.cell[1] === selCell.cell[1];

    return isSameBox || isSameColumn || isSameRow ? 'secondary' : '';
  }

  colorTextForCorrect(correct: any, isInitial: any) {
    if (correct === undefined || isInitial) {
      return 'undefined';
    } else if (correct === false) {
      return 'not-correct';
    } else return 'correct';
  }

  handleGridClick(cell: CellDto): void {
    this.gameService.changePostition(cell);
  }

  finishAnimation(onComplete?: () => void) {
    let i = 1;
    let offset = 0;
    let lastArray: Array<number[]> = [];
    const intervalId = setInterval(() => {
      const array: Array<number[]> = [];
      Array.from({ length: i ** 2 }, (_, index) => {
        const column = Math.floor(index / i);
        const row = index % i;
        array.push([column - offset + 4, row - offset + 4]);
      });
      const borderArray = array.filter(
        ([x1, y1]) => !lastArray.some(([x2, y2]) => x1 === x2 && y1 === y2)
      );
      const cells = document.querySelectorAll('.gridCell');
      cells.forEach((cell) => cell.classList.remove('highlight'));
      borderArray.forEach(([column, row]) => {
        const cell = document.querySelector(
          `.gridCell[data-column="${column}"][data-row="${row}"]`
        );
        if (cell) cell.classList.add('highlight');
      });
      lastArray = array;
      i += 2;
      offset++;
      if (i > 9) {
        clearInterval(intervalId);
        setTimeout(() => {
          const cells = document.querySelectorAll('.gridCell');
          cells.forEach((cell) => cell.classList.remove('highlight'));
          onComplete?.();
        }, 50);
      }
    }, 50);
  }

  repeatFinishAnimation(times: number = 3, onDone?: () => void) {
    let count = 0;

    const run = () => {
      this.finishAnimation(() => {
        count++;
        if (count < times) {
          run();
        } else {
          onDone?.();
        }
      });
    };

    run();
  }

  openDialog() {
    this.dialog.open(EndGameDialogComponent);
  }

  // Canvas /////////////////////////////

  drawCanvas(): void {
    if (!this.gridCanvas || !this.gridContainer) return;
    const canvas: HTMLCanvasElement = this.gridCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--mat-sys-primary')
      .trim();
    const secondaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--mat-sys-secondary')
      .trim();
    if (context) {
      context.lineWidth = 0.5;

      for (let i = 1; i < 9; i++) {
        this.drawLine(context, canvas, i, 9, true, primaryColor); // colonnes
        this.drawLine(context, canvas, i, 9, false, primaryColor); // lignes
      }

      context.strokeStyle = secondaryColor;

      context.lineWidth = 3;

      context.strokeRect(0, 0, canvas.width, canvas.height);

      context.lineWidth = 1.5;

      for (let i = 1; i < 3; i++) {
        this.drawLine(context, canvas, i, 3, true, secondaryColor); // grosses colonnes
        this.drawLine(context, canvas, i, 3, false, secondaryColor); // grosses lignes
      }
    }
  }

  drawLine(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    value: number,
    count: number,
    isVertical: boolean,
    style: string
  ): void {
    context.strokeStyle = style;
    const step = isVertical ? canvas.width / count : canvas.height / count;

    context.beginPath();
    if (isVertical) {
      const x = value * step;
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
    } else {
      const y = value * step;
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
    }
    context.stroke();
  }

  drawStrokeSquare(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    above: boolean,
    below: boolean,
    left: boolean,
    right: boolean,
    x: number,
    y: number,
    value?: number
  ): void {
    const width = canvas.width / 9;
    const height = canvas.height / 9;
    const marginSide = canvas.width / 90;
    const marginUpsides = canvas.height / 90;
    // context.strokeStyle = 'white';
    context.beginPath();
    context.setLineDash([5, 5]); // 5px ligne, 5px espace
    const xZero = x * width - width + (right ? 0 : marginSide);
    const xOne = x * width - (left ? 0 : marginSide);
    const yZero = y * height - height + (above ? 0 : marginUpsides);
    const yOne = y * height - (below ? 0 : marginUpsides);
    context.moveTo(xZero + (value ? marginSide * 3 : 0), yZero);
    if (above) {
      context.moveTo(xOne, yZero);
    } else {
      context.lineTo(xOne, yZero);
    }
    if (left) {
      context.moveTo(xOne, yOne);
    } else {
      context.lineTo(xOne, yOne);
    }
    if (below) {
      context.moveTo(xZero, yOne);
    } else {
      context.lineTo(xZero, yOne);
    }
    if (right) {
      context.moveTo(xZero, yZero + (value ? marginUpsides * 3 : 0));
    } else {
      context.lineTo(xZero, yZero + (value ? marginUpsides * 3 : 0));
    }

    context.stroke();
    context.setLineDash([]); // reset (ligne continue)

    if (value) {
      context.font = '15px Arial';
      // context.fillStyle = 'white';
      const text = `${value}`;
      const textWidth = context.measureText(text).width;
      context.fillText(
        text,
        x * width - width + marginSide * 2 - textWidth / 2,
        y * height - height + marginUpsides * 3
      );
    }
  }

  drawKillerGridCanvas(): void {
    if (
      !this.gridCanvas ||
      !this.gridContainer ||
      this.killerGrid === undefined
    )
      return;
    const canvas: HTMLCanvasElement = this.gridCanvas.nativeElement;
    const context = canvas.getContext('2d');
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--mat-sys-primary')
      .trim();
    const secondaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--mat-sys-secondary')
      .trim();

    if (context) {
      context.fillStyle = secondaryColor;
      context.lineWidth = 1.5;

      this.killerGrid.forEach((e) => {
        e.cells.forEach((c: number[], index: number) => {
          const above = e.cells.some(
            (i: any) => i[0] === c[0] && i[1] === c[1] - 1
          );
          const below = e.cells.some(
            (i: any) => i[0] === c[0] && i[1] === c[1] + 1
          );
          const left = e.cells.some(
            (i: any) => i[0] === c[0] + 1 && i[1] === c[1]
          );
          const right = e.cells.some(
            (i: any) => i[0] === c[0] - 1 && i[1] === c[1]
          );
          this.drawStrokeSquare(
            context,
            canvas,
            above,
            below,
            left,
            right,
            c[0] + 1,
            c[1] + 1,
            index === 0 ? e.value : undefined
          );
        });
      });
    }
  }

  updateCanvasSize(): void {
    if (!this.gridCanvas || !this.gridContainer) return;
    const gridContainer = this.gridContainer.nativeElement;
    const canvas: HTMLCanvasElement = this.gridCanvas.nativeElement;
    const { width, height } = gridContainer.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = width * scale;
    canvas.height = height * scale;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateCanvasSize();
    this.drawCanvas();
    this.drawKillerGridCanvas();
  }
}
