/**
 * BEARS score for creating groups of bears of various sizes.
 * In each case, bear groups may be in any shape or orientation, but two groups may not be placed next to one another.
 * Each group must contain the exact number of bears shown on the scoring card, in order to score
 *
 * A: Score an increasing number of points, based on the total number of pairs of bears
 *
 * B: Score 10 points for each group of exactly three bears.
 *
 * C: Score for each group of bears 1-3 in size, and awards a bonus of 3 points for having one of each of the 3 group sizes.
 *
 * D: Score for each group of bears 2-4 in size
 */

export { BearScoringA } from './bear-a';
export { BearScoringB } from './bear-b';
export { BearScoringC } from './bear-c';
export { BearScoringD } from './bear-d';
