/*
 * Util functions for calculating levels.
 * The exp needed to get to a level is equal to level * growth (= 40).
 * i.e. lvl1 => 40exp, lvl 2 => 80exp, lvl 3 => 120exp etc.
 */

import config from "../config.ts";

// Exp neeed to get to level.
export const expForLevel = (level: number): number => {
    let exp = 0;
    for (let i = 1; i <= level; i++) {
        exp += i * config.expGrowth;
    }

    return exp;
};

// Get level achived by exp
export const getLevel = (exp: number): number => {
    let level = 0;
    while (expForLevel(level + 1) < exp) level++;

    return level;
};

// Total exp needed to get to next level
export const expForNextLevel = (exp: number): number =>
    expForLevel(getLevel(exp) + 1);
