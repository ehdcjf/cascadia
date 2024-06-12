/**
 * ELK score for creating groups of elk. Most elk cards require the groups to be in the exact shape/formation pictured on the card.
 * Unlike bears, elk groups may be placed next to one another, but each elk may only score once, for a single group/formation.
 * When scoring elk groups that are connected, always score the groups based on the interpretation that would result in the largest number of points.
 * (A) Score for groups in straight lines. Straight lines, as pictured, must be connected from flat side to flat side of the hexagons, in any orientation.
 * (B) Score for groups in the exact shapes shown, in any orientation.
 * (C) Score for each contiguous group of elk, an increasing number of points, based on size. These groups may be of any shape or size.
 * (D) Groups must be in a circular formation, as pictured.
 */

import { ElkScoringA } from './elk-a';
import { ElkScoringB } from './elk-b';
import { ElkScoringC } from './elk-c';
import { ElkScoringD } from './elk-d';

export const Elk = {
	A: ElkScoringA,
	B: ElkScoringB,
	C: ElkScoringC,
	D: ElkScoringD,
};
