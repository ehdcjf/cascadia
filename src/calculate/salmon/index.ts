/**
 * SALMON score for creating runs of salmon.
 * A run is defined as a group of adjacent salmon, where each salmon is adjacent to no more than two other salmon.
 * (Note: This means that a group of 3 salmon in a triangle shape may count as a run, but no other salmon may be attached to this run).
 * Each run of salmon may not have any other salmon adjacent to it.
 * (A) Score for each run, based on size, up to a maximum size of 7.
 * (B) Score for each run, based on size, up to a maximum size of 5.
 * (C) Score for each run, based on size, between 3 and 5.
 * (D) Score for each run of salmon, one point for each salmon in the run,
 *     plus one point for each adjacent animal token (type of animal does not matter).
 */

import { ScoringType } from '../../interfaces';
import { SalmonScoringA } from './salmon-a';
import { SalmonScoringB } from './salmon-b';
import { SalmonScoringC } from './salmon-c';
import { SalmonScoringD } from './salmon-d';
export type SalmonScoringType =
	| typeof SalmonScoringA
	| typeof SalmonScoringB
	| typeof SalmonScoringC
	| typeof SalmonScoringD;

export const Salmon: Record<ScoringType, SalmonScoringType> = {
	A: SalmonScoringA,
	B: SalmonScoringB,
	C: SalmonScoringC,
	D: SalmonScoringD,
};
