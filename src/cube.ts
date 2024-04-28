class Cube {
  private column: number;
  private row: number;
  constructor(private q: number, private r: number, private s: number) {
    this.column = this.q + (this.r - (this.r & 1)) / 2;
    this.row = this.r;
  }

  get qrs() {
    return [this.q, this.r, this.s];
  }

  get cr() {
    return [this.column, this.row];
  }

  get neighbor() {
    const directionDifferences = [
      // even rows
      [
        [+1, 0],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, +1],
        [0, +1],
      ],
      // odd rows
      [
        [+1, 0],
        [+1, -1],
        [0, -1],
        [-1, 0],
        [0, +1],
        [+1, +1],
      ],
    ];

    const parity = this.row & 1;
    return directionDifferences[parity].map((diff) => [
      this.column + diff[0],
      this.row + diff[1],
    ]);
  }
}

export function createHexagons(N: number) {
  const hexSet: Set<Cube> = new Set();
  for (let q = -N; q <= N; q++) {
    const r1 = Math.max(-N, -q - N);
    const r2 = Math.min(N, -q + N);
    for (let r = r1; r <= r2; r++) {
      hexSet.add(new Cube(q, r, -q - r));
    }
  }
  return hexSet;
}

// console.log(createHexagons(0));
