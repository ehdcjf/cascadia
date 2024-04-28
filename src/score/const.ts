export const directions = ["NE", "E", "SE", "SW", "W", "NW"];
export const oppositeDirections = ["SW", "W", "NW", "NE", "E", "SE"];

export const linkedTileSides: {
        rowColMapping: [{ rowDiff: number; columnDiff: number }, { rowDiff: number; columnDiff: number }];
        direction: "NE" | "E" | "SE" | "SW" | "W" | "NW";
        oppositeDirection: "NE" | "E" | "SE" | "SW" | "W" | "NW";
        indexMatch: "0-3" | "1-4" | "2-5" | "3-0" | "4-1" | "5-2";
}[] = [
        {
                rowColMapping: [
                        { rowDiff: -1, columnDiff: 0 },
                        { rowDiff: -1, columnDiff: 1 },
                ],
                direction: "NE",
                oppositeDirection: "SW",
                indexMatch: "0-3",
        },
        {
                rowColMapping: [
                        { rowDiff: 0, columnDiff: 1 },
                        { rowDiff: 0, columnDiff: 1 },
                ],
                direction: "E",
                oppositeDirection: "W",
                indexMatch: "1-4",
        },
        {
                rowColMapping: [
                        { rowDiff: 1, columnDiff: 0 },
                        { rowDiff: 1, columnDiff: 1 },
                ],
                direction: "SE",
                oppositeDirection: "NW",
                indexMatch: "2-5",
        },
        {
                rowColMapping: [
                        { rowDiff: 1, columnDiff: -1 },
                        { rowDiff: 1, columnDiff: 0 },
                ],
                direction: "SW",
                oppositeDirection: "NE",
                indexMatch: "3-0",
        },
        {
                rowColMapping: [
                        { rowDiff: 0, columnDiff: -1 },
                        { rowDiff: 0, columnDiff: -1 },
                ],
                direction: "W",
                oppositeDirection: "E",
                indexMatch: "4-1",
        },
        {
                rowColMapping: [
                        { rowDiff: -1, columnDiff: -1 },
                        { rowDiff: -1, columnDiff: 0 },
                ],
                direction: "NW",
                oppositeDirection: "SE",
                indexMatch: "5-2",
        },
];
