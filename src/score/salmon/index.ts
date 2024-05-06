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

export { SalmonScoringA } from './salmon-a';
export { SalmonScoringB } from './salmon-b';
export { SalmonScoringC } from './salmon-c';
export { SalmonScoringD } from './salmon-d';
