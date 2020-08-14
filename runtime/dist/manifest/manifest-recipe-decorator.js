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
import { ConnectionConstraint } from '../constraints/connection-constraint.js';
const nop = (...args) => { };
const assert = nop;
export class ManifestError extends Error {
    //severity = ErrorSeverity.Error;
    constructor(location, message) {
        super(message);
        this.location = location;
    }
}
export class ManifestRecipeDecorator {
    static decorate(manifest, recipe, recipeItems) {
        recipe["items"] = {
            require: ManifestParser.extract('require', recipeItems),
            handles: ManifestParser.extract('handle', recipeItems),
            // requireHandles are handles constructed by the 'handle' keyword. This is intended to replace handles.
            requireHandles: ManifestParser.extract('require-handle', recipeItems),
            syntheticHandles: ManifestParser.extract('synthetic-handle', recipeItems),
            byHandle: new Map(),
            particles: ManifestParser.extract('recipe-particle', recipeItems),
            byParticle: new Map(),
            slots: ManifestParser.extract('slot', recipeItems),
            bySlot: new Map(),
            // tslint:disable-next-line: no-any
            byName: new Map(),
            connections: ManifestParser.extract('connection', recipeItems),
            search: ManifestParser.extract('search', recipeItems),
            description: ManifestParser.extract('description', recipeItems)
        };
        //
        recipe["handles"] = [];
        this.decorateHandles(manifest, recipe);
        //
        recipe["connectionConstraints"] = [];
        this.decorateConnections(manifest, recipe);
    }
    static decorateHandles(manifest, recipe) {
        const { items } = recipe;
        // A recipe should either source handles by the 'handle' keyword (requireHandle item) or use fates (handle item).
        // A recipe should not use both methods.
        assert(!(items.handles.length > 0 && items.requireHandles.length > 0), `Inconsistent handle definitions`);
        //
        const itemHandles = (items.handles.length > 0 ? items.handles : items.requireHandles);
        for (const item of itemHandles) {
            // SJM: create special data-structure separate from ast-handle
            //const handle = recipe.newHandle();
            const handle = { id: '', tags: [], localName: '', fate: '', mapToStorage: nop };
            recipe.handles.push(handle);
            //
            // TODO(sjmiles): what is a 'ref'?
            const ref = item.ref;
            if (ref.id) {
                handle.id = ref.id;
                const targetStore = null; //manifest.findStoreById(handle.id);
                if (targetStore) {
                    handle.mapToStorage(targetStore);
                }
            }
            else if (ref.name) {
                const targetStore = null; //manifest.findStoreByName(ref.name);
                // TODO: Error handling.
                assert(targetStore, `Could not find handle ${ref.name}`);
                handle.mapToStorage(targetStore);
            }
            handle.tags = ref.tags;
            if (item.name) {
                assert(!items.byName.has(item.name), `duplicate handle name: ${item.name}`);
                handle.localName = item.name;
                items.byName.set(item.name, { item, handle });
            }
            handle.fate = item.kind === 'handle' && item.fate ? item.fate : null;
            if (item.kind === 'handle') {
                if (item.annotations) {
                    //handle.annotations = Manifest._buildAnnotationRefs(manifest, item.annotations);
                }
            }
            items.byHandle.set(handle, item);
        }
        //   for (const item of items.syntheticHandles) {
        //     const handle = recipe.newHandle();
        //     handle.fate = 'join';
        //     if (item.name) {
        //       assert(!items.byName.has(item.name), `duplicate handle name: ${item.name}`);
        //       handle.localName = item.name;
        //       items.byName.set(item.name, {item, handle});
        //     }
        //     for (const association of item.associations) {
        //       const associatedItem = items.byName.get(association);
        //       assert(associatedItem, `unrecognized name: ${association}`);
        //       const associatedHandle = associatedItem && associatedItem.handle;
        //       assert(associatedHandle, `only handles allowed to be joined: "${association}" is not a handle`);
        //       handle.joinDataFromHandle(associatedHandle);
        //     }
        //     items.byHandle.set(handle, item);
        //   }
    }
    static decorateConnections(manifest, recipe) {
        for (const connection of recipe.items.connections) {
            const from = this.prepareEndpoint(manifest, recipe, connection, connection.from);
            const to = this.prepareEndpoint(manifest, recipe, connection, connection.to);
            const constraint = new ConnectionConstraint(from, to, connection.direction, connection.relaxed, 'constraint');
            recipe.connectionConstraints.push(constraint);
        }
    }
    static prepareEndpoint(manifest, recipe, connection, info) {
        switch (info.targetType) {
            case 'particle': {
                const particle = manifest.findParticleByName(info.particle);
                if (!particle) {
                    throw new ManifestError(connection.location, `could not find particle '${info.particle}'`);
                }
                if (info.param !== null && !particle.handleConnectionMap.has(info.param)) {
                    throw new ManifestError(connection.location, `param '${info.param}' is not defined by '${info.particle}'`);
                }
                return null; //new ParticleEndPoint(particle, info.param);
            }
            case 'localName': {
                if (!recipe.items.byName.has(info.name)) {
                    throw new ManifestError(connection.location, `local name '${info.name}' does not exist in recipe`);
                }
                if (info.param == null && info.tags.length === 0 &&
                    recipe.items.byName.get(info.name).handle) {
                    return null; //new HandleEndPoint(items.byName.get(info.name).handle);
                }
                throw new ManifestError(connection.location, `references to particles by local name not yet supported`);
            }
            case 'tag': {
                return null; //new TagEndPoint(info.tags);
            }
            default:
                throw new ManifestError(connection.location, `endpoint ${info.targetType} not supported`);
        }
    }
    ;
}
