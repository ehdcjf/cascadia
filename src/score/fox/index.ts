/**
 * FOXES score for adjacencies to other animals.
 * Foxes score either individually or in pairs, and each fox or fox pair is independently scored,
 * with an increasing number of points,
 * depending on whether conditions are met in any of the adjacent habitat spaces (6 in the case of a single fox, 8 in the case of a fox pair in Card D).
 * (A) Score for each fox, an increasing number of points based on the number of unique animal types (including other foxes) directly adjacent to it.
 * (B) Score for each fox, an increasing number of points based on the number of unique animal pairs (not including other fox pairs) directly adjacent to it. As pictured, pairs of other animals do not need to be adjacent to each other.
 * (C) Score for each fox, an increasing number of points based on the number of similar animals (not including other foxes) directly adjacent to it. Only score the most abundant adjacent animal type.
 * (D) Score for each fox pair, an increasing number of points based on the number of unique animal pairs (not including other fox pairs) directly adjacent to it. As pictured, pairs of other animals do not need to be adjacent to each other.
 */

export { FoxScoringA } from './fox-a';
export { FoxScoringB } from './fox-b';
export { FoxScoringC } from './fox-c';
export { FoxScoringD } from './fox-d';
