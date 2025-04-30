export class CellDto {
  cell: number[] = [0, 0];
  box: number[] = [0, 0];
  value?: number | undefined;
  correct?: boolean | undefined;
  isInitial?: boolean | undefined;
}
