/**
 * @license
 * Copyright 2020 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
declare type Recipe = any;
declare type Particle = any;
declare type Handle = any;
declare type AnnotationRef = any;
declare type IngressValidation = any;
/** Generates plan objects from resolved recipes. */
export declare class PlanGenerator {
    private recipes;
    private namespace;
    private readonly ingressValidation;
    constructor(recipes: Recipe[], namespace: string, ingressValidation?: IngressValidation);
    /** Generates a Kotlin file with plan classes derived from resolved recipes. */
    generate(): Promise<string>;
    /** Converts a resolved recipe into a `Plan` object. */
    createPlans(): Promise<string[]>;
    /**
     * @returns a name of the generated Kotlin variable with a Plan.handle corresponding to the given handle.
     */
    handleVariableName(handle: Handle): string;
    /** Generates a Kotlin `Plan.Particle` instantiation from a Particle. */
    generateParticle(particle: Particle): Promise<string>;
    static createAnnotations(annotations: AnnotationRef[]): string;
    fileHeader(): string;
    fileFooter(): string;
}
export {};
