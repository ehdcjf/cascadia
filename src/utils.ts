export function idToRowColumn(id: string) {
        return id.split("-").map(Number);
}

export function getRowColMapIndex(row: number) {
        return row % 2 == 0 ? 0 : 1;
}
