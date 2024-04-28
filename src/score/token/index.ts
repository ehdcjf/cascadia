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
