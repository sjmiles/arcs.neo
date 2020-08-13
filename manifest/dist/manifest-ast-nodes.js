/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
//import {ClaimType} from './claim.js';
//import {CheckType} from './check.js';
export var ClaimType;
(function (ClaimType) {
    ClaimType["IsTag"] = "is-tag";
    ClaimType["DerivesFrom"] = "derives-from";
})(ClaimType || (ClaimType = {}));
export var CheckType;
(function (CheckType) {
    CheckType["HasTag"] = "has-tag";
    CheckType["IsFromHandle"] = "is-from-handle";
    CheckType["IsFromOutput"] = "is-from-output";
    CheckType["IsFromStore"] = "is-from-store";
    CheckType["Implication"] = "implication";
})(CheckType || (CheckType = {}));
/**
 * A base token interface for the `kind` and `location` entries. This creates
 * a TypeScript Discriminated Union for most tokens.
 */
export class BaseNode {
}
export class BaseNodeWithRefinement extends BaseNode {
}
export function isCollectionType(node) {
    return node.kind === 'collection-type';
}
export function isTypeVariable(node) {
    return node.kind === 'variable-type';
}
export function isSlotType(node) {
    return node.kind === 'slot-type';
}
export function slandleType(arg) {
    if (isSlotType(arg.type)) {
        return arg.type;
    }
    if (isCollectionType(arg.type) && isSlotType(arg.type.type)) {
        return arg.type.type;
    }
    return undefined;
}
export const RELAXATION_KEYWORD = 'someof';
export var Op;
(function (Op) {
    Op["AND"] = "and";
    Op["OR"] = "or";
    Op["LT"] = "<";
    Op["GT"] = ">";
    Op["LTE"] = "<=";
    Op["GTE"] = ">=";
    Op["ADD"] = "+";
    Op["SUB"] = "-";
    Op["MUL"] = "*";
    Op["DIV"] = "/";
    Op["NOT"] = "not";
    Op["NEG"] = "neg";
    Op["EQ"] = "==";
    Op["NEQ"] = "!=";
})(Op || (Op = {}));
export var Primitive;
(function (Primitive) {
    Primitive["BOOLEAN"] = "Boolean";
    Primitive["NUMBER"] = "Number";
    Primitive["BIGINT"] = "BigInt";
    Primitive["LONG"] = "Long";
    Primitive["INT"] = "Int";
    Primitive["TEXT"] = "Text";
    Primitive["UNKNOWN"] = "~query_arg_type";
})(Primitive || (Primitive = {}));
export const discreteTypes = [
    Primitive.BIGINT,
    Primitive.LONG,
    Primitive.INT
];
export function preSlandlesDirectionToDirection(direction, isOptional = false) {
    // TODO(jopra): Remove after syntax unification.
    // Use switch for totality checking.
    const opt = isOptional ? '?' : '';
    switch (direction) {
        case 'reads':
            return `reads${opt}`;
        case 'writes':
            return `writes${opt}`;
        case 'reads writes':
            return `reads${opt} writes${opt}`;
        case '`consumes':
            return `\`consumes${opt}`;
        case '`provides':
            return `\`provides${opt}`;
        case 'hosts':
            return `hosts${opt}`;
        case 'any':
            return `any${opt}`;
        default:
            // Catch nulls and unsafe values from javascript.
            throw new Error(`Bad pre slandles direction ${direction}`);
    }
}
export function viewAst(ast, viewLocation = false) {
    // Helper function useful for viewing ast information while working on the parser and test code:
    // Optionally, strips location information.
    console.log(JSON.stringify(ast, (_key, value) => {
        if (!viewLocation && value != null && value['location']) {
            delete value['location'];
        }
        return typeof value === 'bigint'
            ? value.toString() // Workaround for JSON not supporting bigint.
            : value;
    }, // return everything else unchanged
    2));
}
