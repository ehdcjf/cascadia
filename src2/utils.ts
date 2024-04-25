export function neighbourTiles(tileID: string) {
        const [row, column] = tileID.split("-").map(Number);
        const even = [
                [0, 1],
                [0, -1],
                [1, 0],
                [-1, 0],
                [-1, -1],
                [1, -1],
        ];
        const odd = [
                [0, 1],
                [0, -1],
                [-1, 0],
                [1, 0],
                [1, 1],
                [-1, +1],
        ];
        const potientialPlaceMent = row % 2 == 0 ? even : odd;
        return potientialPlaceMent.map(([dr, dc]) => `${row + dr}-${column + dc}`);
}
