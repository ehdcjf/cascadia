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
export { HawkScoringA } from './hawk-a';
export { HawkScoringB } from './hawk-b';
export { HawkScoringC } from './hawk-c';
export { HawkScoringD } from './hawk-d';
