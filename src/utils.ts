<<<<<<< HEAD

export function allPossibleCases(arr:any[]){

}

export function indexOfMax(arr: number[]) {
  if (arr.length == 0) return -1;
  let max = arr[0];
  let maxIndex = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i;
      max = arr[i];
    }
  }
  return maxIndex;
}
=======
export function idToRowColumn(id: string) {
        return id.split("-").map(Number);
}

export function getRowColMapIndex(row: number) {
        return row % 2 == 0 ? 0 : 1;
}
>>>>>>> v2
