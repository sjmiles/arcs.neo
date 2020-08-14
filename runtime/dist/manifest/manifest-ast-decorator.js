/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
//import {Id} from './id.js';
import { ManifestParser } from '../../../manifest-parser/dist/manifest-parser.js';
import { ManifestRecipeDecorator } from './manifest-recipe-decorator.js';
export class ManifestAstDecorator {
    // static kindItems(items, kind: string) {
    //   return items.filter(i => i.kind === kind);
    // }
    static decorate(items) {
        const manifest = {
            ast: items,
            recipes: []
        };
        this._decorate(manifest, items, 'recipe');
        return manifest;
    }
    static _decorate(manifest, items, kind) {
        const fn = `decorate_${kind}`;
        if (this[fn]) {
            const kindItems = ManifestParser.extract(kind, items);
            kindItems.forEach(item => (this[fn])(manifest, item));
        }
    }
    static decorate_meta(manifest, item) {
    }
    static decorate_recipe(manifest, item) {
        const recipe = {
            name: item.name,
            //annotations: this.buildAnnotationRefs(manifest, item.annotationRefs),
            verbs: item.verbs
        };
        ManifestRecipeDecorator.decorate(manifest, recipe, item.items);
        console.log('decorate_recipe', item, recipe);
        manifest.recipes.push(recipe);
    }
    // The items to process may refer to items defined later on. We should do a pass over all
    // definitions first, and then resolve all the references to external definitions, but that
    // would require serious refactoring. As a short term fix we're doing multiple passes over
    // the list as long as we see progress.
    // TODO(b/156427820): Improve this with 2 pass schema resolution and support cycles.
    static async processItems(items, kind, f) {
        let itemsToProcess = [...items.filter(i => i.kind === kind)];
        let firstError;
        let thisRound = [];
        do {
            thisRound = itemsToProcess;
            itemsToProcess = [];
            firstError = null;
            for (const item of thisRound) {
                try {
                    this.augmentWithTypes(item);
                    await f(item);
                }
                catch (err) {
                    if (!firstError)
                        firstError = err;
                    itemsToProcess.push(item);
                    continue;
                }
            }
            // As long as we're making progress we're trying again.
        } while (itemsToProcess.length < thisRound.length);
        // If we didn't make any progress and still have items to process,
        // rethrow the first error we saw in this round.
        if (itemsToProcess.length > 0)
            throw firstError;
    }
    ;
    static augmentWithTypes(item) {
        // const visitor = new class extends ManifestVisitor {
        //   constructor() {
        //     super();
        //   }
        //   visit(node, visitChildren: Runnable) {
        //     // TODO(dstockwell): set up a scope and merge type variables here, so that
        //     //     errors relating to failed merges can reference the manifest source.
        //     visitChildren();
        //     switch (node.kind) {
        //       case 'schema-inline': {
        //         const schemas: Schema[] = [];
        //         const aliases: Schema[] = [];
        //         const names: string[] = [];
        //         for (const name of node.names) {
        //           const resolved = manifest.resolveTypeName(name);
        //           if (resolved && resolved.schema && resolved.schema.isAlias) {
        //             aliases.push(resolved.schema);
        //           } else {
        //             names.push(name);
        //           }
        //           if (resolved && resolved.schema) {
        //             schemas.push(resolved.schema);
        //           }
        //         }
        //         // tslint:disable-next-line: no-any
        //         const fields: Dictionary<any> = {};
        //         const typeData = {};
        //         for (let {name, type} of node.fields) {
        //           if (type && type.refinement) {
        //             type.refinement = Refinement.fromAst(type.refinement, {[name]: type.type});
        //           }
        //           for (const schema of schemas) {
        //             if (!type) {
        //               // If we don't have a type, try to infer one from the schema.
        //               type = schema.fields[name];
        //             } else {
        //               // Validate that the specified or inferred type matches the schema.
        //               const externalType = schema.fields[name];
        //               if (externalType && !Schema.fieldTypeIsAtLeastAsSpecificAs(externalType, type)) {
        //                 throw new ManifestError(node.location, `Type of '${name}' does not match schema (${type} vs ${externalType})`);
        //               }
        //             }
        //           }
        //           if (!type) {
        //             throw new ManifestError(node.location, `Could not infer type of '${name}' field`);
        //           }
        //           fields[name] = type;
        //           typeData[name] = type.type;
        //         }
        //         const refinement = node.refinement && Refinement.fromAst(node.refinement, typeData);
        //         let schema = new Schema(names, fields, {refinement});
        //         for (const alias of aliases) {
        //           schema = Schema.union(alias, schema);
        //           if (!schema) {
        //             throw new ManifestError(node.location, `Could not merge schema aliases`);
        //           }
        //         }
        //         node.model = new EntityType(schema);
        //         delete node.fields;
        //         return;
        //       }
        //       case 'variable-type': {
        //         const constraint = node.constraint && node.constraint.model;
        //         node.model = TypeVariable.make(node.name, constraint, null);
        //         return;
        //       }
        //       case 'slot-type': {
        //         const fields = {};
        //         for (const fieldIndex of Object.keys(node.fields)) {
        //           const field = node.fields[fieldIndex];
        //           fields[field.name] = field.value;
        //         }
        //         node.model = SlotType.make(fields['formFactor'], fields['handle']);
        //         return;
        //       }
        //       case 'type-name': {
        //         const resolved = manifest.resolveTypeName(node.name);
        //         if (!resolved) {
        //           throw new ManifestError(
        //             node.location,
        //             `Could not resolve type reference to type name '${node.name}'`);
        //         }
        //         if (resolved.schema) {
        //           node.model = new EntityType(resolved.schema);
        //         } else if (resolved.iface) {
        //           node.model = new InterfaceType(resolved.iface);
        //         } else {
        //           throw new ManifestError(node.location, 'Expected {iface} or {schema}');
        //         }
        //         return;
        //       }
        //       case 'collection-type':
        //         node.model = new CollectionType(node.type.model);
        //         return;
        //       case 'big-collection-type':
        //         node.model = new BigCollectionType(node.type.model);
        //         return;
        //       case 'reference-type':
        //         node.model = new ReferenceType(node.type.model);
        //         return;
        //       case 'mux-type':
        //         node.model = new MuxType(node.type.model);
        //         return;
        //       case 'singleton-type':
        //         node.model = new SingletonType(node.type.model);
        //         return;
        //       case 'tuple-type':
        //         node.model = new TupleType(node.types.map(t => t.model));
        //         return;
        //       default:
        //         return;
        //     }
        //   }
        // }();
        // visitor.traverse(items);
    }
}
