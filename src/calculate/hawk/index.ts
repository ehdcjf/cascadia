/**
 * HAWKS score for spreading out over the landscape.
 * Hawks can score for either each hawk, each pair of hawks,
 * or for lines of sight between hawks.
 * A line of sight is a straight line from flat side to flat side of the hexagons, as pictured.
 * A line of sight is only interrupted by the presence of another hawk (therefore, line of sight may not cross from one hawk to another, through a hawk).
 *
 * (A) Score an increasing number of points for each hawk that is not adjacent to any other hawk.
 * (B) Score an increasing number of points for each hawk that is not adjacent to any other hawk,
 *     and also has a direct line of sight to another hawk.
 * (C) Score 3 points for each line of sight between two hawks.
 *     (Note: multiple lines of sight may involve the same hawk).
 * (D) Score for each pair of hawks,
 *     an increasing number of points based on the number of unique animal types between them
 *     (not including other hawks). Each hawk may only be part of one pair.
 *
 *
 *
 *
 */
import { ScoringType } from '../../interfaces';
import { HawkScoringA } from './hawk-a';
import { HawkScoringB } from './hawk-b';
import { HawkScoringC } from './hawk-c';
import { HawkScoringD } from './hawk-d';

export type HawkScoringType = typeof HawkScoringA | typeof HawkScoringB | typeof HawkScoringC | typeof HawkScoringD;

export const Hawk: Record<ScoringType, HawkScoringType> = {
	A: HawkScoringA,
	B: HawkScoringB,
	C: HawkScoringC,
	D: HawkScoringD,
};
