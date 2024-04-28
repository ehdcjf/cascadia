<<<<<<< HEAD
import { calculateBearScoring } from "./bear";

export const tokenScoring = {
        bear: { tokenScore: 0 },
        elk: { tokenScore: 0 },
        fox: { tokenScore: 0 },
        hwak: { tokenScore: 0 },
        salmon: { tokenScore: 0 },
};

export function calculateScoring() {
        const bearScore = calculateBearScoring();
}
=======
import { WildLife } from "../../interfaces";
import { allPlacedTokens } from "../tile";
import { calculateBearScoring } from "./bear";
import { FoxScoring } from "./fox";

export const tokenScoring = {
        bear: { tokenScore: 0 },
        elk: { tokenScore: 0 },
        fox: { tokenScore: 0 },
        hwak: { tokenScore: 0 },
        salmon: { tokenScore: 0 },
};

type TokenIDsRecord = Record<WildLife, string[]>;

export function calculateScoring() {
        const tokenIDsRecord = Object.entries(allPlacedTokens).reduce(
                (r: TokenIDsRecord, v) => {
                        const [tokenId, wildlife] = v;
                        if (wildlife) r[wildlife as WildLife].push(tokenId);
                        return r;
                },
                {
                        bear: [],
                        elk: [],
                        fox: [],
                        hwak: [],
                        salmon: [],
                } as unknown as TokenIDsRecord,
        );

        const bearScore = calculateBearScoring();
        const foxScore = new FoxScoring().run(tokenIDsRecord["fox"]);
}
>>>>>>> v2
