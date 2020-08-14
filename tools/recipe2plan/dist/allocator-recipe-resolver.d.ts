/**
 * @license
 * Copyright 2020 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import { ManifestParser } from '../../../manifest-parser/dist/manifest-parser.js';
import { Dictionary } from '../../../common/dist/hot.js';
declare type Recipe = Dictionary<any>;
export declare class AllocatorRecipeResolverError extends Error {
    constructor(message: string);
}
/**
 * Resolves recipes in preparation for the Allocator.
 *
 * The Allocator expects artifacts to be resolved in a way that is conducive for partition (particles should be
 * distributed to the proper ArcHost) and lifecycle management (for arcs within ArcHosts).
 */
export declare class AllocatorRecipeResolver {
    private randomSalt;
    private createHandleIndex;
    private ast;
    constructor(ast: ManifestParser, randomSalt: string);
    /**
     * Produces resolved recipes with storage keys.
     *
     * @throws Error if recipe fails to resolve on first or second pass.
     * @returns Resolved recipes (with Storage Keys).
     */
    resolve(): Promise<Recipe[]>;
    validateHandles(recipe: Recipe): void;
}
/** Returns true if input recipe is for a long-running arc. */
export declare function isLongRunning(recipe: Recipe): boolean;
/** Returns arcId for long-running arcs, null otherwise. */
export declare function findLongRunningArcId(recipe: Recipe): string | null;
export {};
