import { MapItem } from "../../board";
import { Queue } from "../../utils";
const BearScoringValue: Record<number, number> = {
        0: 0,
        1: 4,
        2: 11,
        3: 19,
        4: 27,
};
export class BearScoring {
        private usedToken: Set<string> = new Set();
        private confirmedBearPairs = 0;
        constructor(mapData: Map<string, MapItem>) {
                for (const [key, mapItem] of mapData) {
                        if (mapItem.placedToken != "bear" || this.usedToken.has(key)) continue;
                        const q = new Queue();
                        const potentialTokneKeys: string[] = [];
                        q.push(key);
                        this.usedToken.add(key);

                        while (q.size > 0) {
                                const now = q.pop();
                                const neighborKeys = mapData.get(now)!.coor.neighborKeys;
                                for (const nkey of neighborKeys) {
                                        if (!mapData.has(nkey) || this.usedToken.has(nkey)) continue;
                                        const neighborItem = mapData.get(nkey)!;
                                        if (neighborItem.placedToken == "bear") {
                                                potentialTokneKeys.push(nkey);
                                                q.push(nkey);
                                                this.usedToken.add(nkey);
                                        }
                                }
                        }

                        if (potentialTokneKeys.length == 2) {
                                if (this.confirmedBearPairs <= 4) this.confirmedBearPairs++;
                        }
                }
        }

        get score() {
                return BearScoringValue[this.confirmedBearPairs];
        }
}
