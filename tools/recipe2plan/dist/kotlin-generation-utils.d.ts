/**
 * @license
 * Copyright (c) 2020 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Kotlin language formatting preferences.
 */
export interface KotlinPreferences {
    indent: number;
    lineLength: number;
}
/**
 * Default language formatting settings.
 */
export declare const KT_DEFAULT: KotlinPreferences;
/**
 * Collection of utilities for generating Kotlin code.
 */
export declare class KotlinGenerationUtils {
    pref: KotlinPreferences;
    constructor(pref?: KotlinPreferences);
    /**
     * Formats a function application in Kotlin.
     *
     * @param name name of the function
     * @param args list of arguments to the function
     * @param opts additional options for formatting
     */
    applyFun(name: string, args: string[], { startIndent, emptyName, numberOfIndents }?: {
        startIndent?: number;
        emptyName?: string;
        numberOfIndents?: number;
    }): string;
    /** Formats `mapOf` with correct indentation and defaults. */
    mapOf(args: string[], startIndent?: number): string;
    /** Formats `mutableMapOf` with correct indentation and defaults. */
    mutableMapOf(args: string[], startIndent?: number): string;
    /** Formats `listOf` with correct indentation and defaults. */
    listOf(args: string[], startIndent?: number): string;
    /** Formats `setOf` with correct indentation and defaults. */
    setOf(args: string[], startIndent?: number): string;
    /**
     * Joins a list of items, taking line length and indentation into account.
     *
     * @param items strings to join
     * @param opts additional options for formatting
     */
    joinWithIndents(items: string[], { startIndent, numberOfIndents }?: {
        startIndent?: number;
        numberOfIndents?: number;
    }): string;
    /** Indent a codeblock with the preferred indentation. */
    indent(block: string, numberOfIndents?: number): string;
    /**
     * Joins a list of lines, indenting all but the first one.
     */
    indentFollowing(lines: string[], numberOfIndents: number): string;
}
/** Everyone's favorite NPM module, install not required. */
export declare function leftPad(input: string, indent: number, skipFirst?: boolean): string;
/** Format a Kotlin string. */
export declare function quote(s: string): string;
/** Produces import statement if target is not within the same package. */
export declare function tryImport(importName: string, packageName: string): string;
/** Coalesces input string such that the first character is upper case. */
export declare function upperFirst(s: string): string;
