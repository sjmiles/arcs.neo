/**
 * @license
 * Copyright (c) 2019 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
export class Predicates {
}
/** A Predicate that always succeeds */
Predicates.alwaysTrue = () => true;
/** A Predicate that always fails */
Predicates.alwaysFalse = () => false;
/**
 * Combines boolean expressions into a single value for use in switch cases.
 *
 * For example:
 *   switch(when(condition1, condition2)) {
 *     case when(true, true): break;
 *     case when(true, false): break;
 *     case when(false, true): break;
 *     case when(false, false): break;
 *   }
 *
 */
export function when(...conditions) {
    return conditions.reduce((acc, x, idx) => Number(x) << idx | acc, 0) + conditions.length;
}
