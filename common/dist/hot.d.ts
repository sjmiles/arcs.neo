/**
 * @license
 * Copyright (c) 2019 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Higher Order Types
 */
/** A function type that returns a value of type `T` */
export declare type Producer<T> = () => T;
/** A function that takes a value of type `T` as input. */
export declare type Consumer<T> = (input: T) => void;
/** A function that takes a value of type `T` as input and can be awaited for completion. */
export declare type AsyncConsumer<T> = (input: T) => Promise<void>;
/** A function that just runs; it takes no values and returns nothing. */
export declare type Runnable = () => void;
/** A function that converts some input into a boolean, often use for calls like `filter`. */
export declare type Predicate<T> = (input: T) => boolean;
export declare class Predicates {
    /** A Predicate that always succeeds */
    static readonly alwaysTrue: <T>() => boolean;
    /** A Predicate that always fails */
    static readonly alwaysFalse: <T>() => boolean;
}
/** A function that maps an input to an output. */
export declare type Mapper<I, O> = (input: I) => O;
/**
 * The base type for Literals, i.e. objects that have been serialized into JSON.
 *
 * ## Note
 * `JSON.parse(...)` returns an `any` type. Our definition for literal types is stricter: we demand that values are at
 * least objects (they cannot be `null`, `undefined`, or primitive types).
 */
export interface Literal {
}
/**
 * An interface for types that can be converted to and from a `Literal` type.
 *
 * @param T the origin type
 * @param Lit a Literal type, akin to JSON.
 */
export interface Literalizable<T, Lit extends Literal> {
    /** Convert the current instance into a Literal */
    prototype: {
        toLiteral(): Lit;
    };
    /** @return the original type from a Literal, statically */
    fromLiteral(literal: Lit): T;
}
/** A light-weight, parameterized key-value store Type */
export interface Dictionary<T> {
    [key: string]: T;
}
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
export declare function when(...conditions: boolean[]): number;
