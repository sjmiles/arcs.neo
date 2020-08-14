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

import * as AstNode from '../../../manifest-parser/dist/manifest-ast-nodes.js';
import {ManifestParser} from '../../../manifest-parser/dist/manifest-parser.js';
import {ConnectionConstraint} from '../constraints/connection-constraint.js';

const nop = (...args) => {};
const assert = nop;

type Manifest = {};
type Handle = {};
type Particle = {};
type Slot = {};
type Recipe = {};

export class ManifestError extends Error {
  location: AstNode.SourceLocation;
  key: string;
  //severity = ErrorSeverity.Error;
  constructor(location: AstNode.SourceLocation, message: string) {
    super(message);
    this.location = location;
  }
}

export class ManifestRecipeDecorator {
  static decorate(manifest: Manifest, recipe: Recipe, recipeItems: AstNode.RecipeItem[]) {
    recipe["items"] = {
      require: ManifestParser.extract('require', recipeItems) as AstNode.RecipeRequire[],
      handles: ManifestParser.extract('handle', recipeItems) as AstNode.RecipeHandle[],
      // requireHandles are handles constructed by the 'handle' keyword. This is intended to replace handles.
      requireHandles: ManifestParser.extract('require-handle', recipeItems) as AstNode.RequireHandleSection[],
      syntheticHandles: ManifestParser.extract('synthetic-handle', recipeItems) as AstNode.RecipeSyntheticHandle[],
      byHandle: new Map<Handle, AstNode.RecipeHandle | AstNode.RecipeSyntheticHandle | AstNode.RequireHandleSection>(),
      particles: ManifestParser.extract('recipe-particle', recipeItems) as AstNode.RecipeParticle[],
      byParticle: new Map<Particle, AstNode.RecipeParticle>(),
      slots: ManifestParser.extract('slot', recipeItems) as AstNode.RecipeSlot[],
      bySlot: new Map<Slot, AstNode.RecipeSlot | AstNode.RecipeParticleSlotConnection>(),
      // tslint:disable-next-line: no-any
      byName: new Map<string, any>(),
      connections: ManifestParser.extract('connection', recipeItems) as AstNode.RecipeConnection[],
      search: ManifestParser.extract('search', recipeItems) as AstNode.RecipeSearch[],
      description: ManifestParser.extract('description', recipeItems) as AstNode.Description[]
    };
    //
    recipe["handles"] = [];
    this.decorateHandles(manifest, recipe);
    //
    recipe["connectionConstraints"] = [];
    this.decorateConnections(manifest, recipe);
  }
  private static decorateHandles(manifest, recipe) {
    const {items} = recipe;
    // A recipe should either source handles by the 'handle' keyword (requireHandle item) or use fates (handle item).
    // A recipe should not use both methods.
    assert(!(items.handles.length > 0 && items.requireHandles.length > 0), `Inconsistent handle definitions`);
    //
    const itemHandles = (items.handles.length > 0 ? items.handles : items.requireHandles) as (AstNode.RecipeHandle | AstNode.RequireHandleSection)[];
    for (const item of itemHandles) {
      // SJM: create special data-structure separate from ast-handle
      //const handle = recipe.newHandle();
      const handle = {id:'', tags: [], localName: '', fate: '', mapToStorage: nop};
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
      } else if (ref.name) {
        const targetStore = null; //manifest.findStoreByName(ref.name);
        // TODO: Error handling.
        assert(targetStore, `Could not find handle ${ref.name}`);
        handle.mapToStorage(targetStore);
      }
      handle.tags = ref.tags;
      if (item.name) {
        assert(!items.byName.has(item.name), `duplicate handle name: ${item.name}`);
        handle.localName = item.name;
        items.byName.set(item.name, {item, handle});
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
  private static decorateConnections(manifest, recipe) {
    for (const connection of recipe.items.connections) {
      const from = this.prepareEndpoint(manifest, recipe, connection, connection.from);
      const to = this.prepareEndpoint(manifest, recipe, connection, connection.to);
      const constraint = new ConnectionConstraint(from, to, connection.direction, connection.relaxed, 'constraint');
      recipe.connectionConstraints.push(constraint);
    }
  }
  private static prepareEndpoint(manifest, recipe, connection, info) {
    switch (info.targetType) {
      case 'particle': {
        const particle = manifest.findParticleByName(info.particle);
        if (!particle) {
          throw new ManifestError(
            connection.location,
            `could not find particle '${info.particle}'`);
        }
        if (info.param !== null && !particle.handleConnectionMap.has(info.param)) {
          throw new ManifestError(
            connection.location,
            `param '${info.param}' is not defined by '${info.particle}'`);
        }
        return null; //new ParticleEndPoint(particle, info.param);
      }
      case 'localName': {
        if (!recipe.items.byName.has(info.name)) {
          throw new ManifestError(
            connection.location,
            `local name '${info.name}' does not exist in recipe`);
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
  };

  //   if (items.search) {
  //     recipe.search = new Search(items.search.phrase, items.search.tokens);
  //   }

  //   for (const item of items.slots) {
  //     // TODO(mmandlis): newSlot requires a name. What should the name be here?
  //     const slot = recipe.newSlot(undefined);
  //     if (item.ref.id) {
  //       slot.id = item.ref.id;
  //     }
  //     if (item.ref.tags) {
  //       slot.tags = item.ref.tags;
  //     }
  //     if (item.name) {
  //       assert(!items.byName.has(item.name), `Duplicate slot local name ${item.name}`);
  //       slot.localName = item.name;
  //       items.byName.set(item.name, slot);
  //     }
  //     items.bySlot.set(slot, item);
  //   }

  //   // TODO: disambiguate.
  //   for (const item of items.particles) {
  //     const particle = recipe.newParticle(item.ref.name);
  //     particle.verbs = item.ref.verbs;

  //     if (!(recipe instanceof RequireSection)) {
  //       if (item.ref.name) {
  //         const spec = manifest.findParticleByName(item.ref.name);
  //         if (!spec) {
  //           throw new ManifestError(item.location, `could not find particle ${item.ref.name}`);
  //         }
  //         particle.spec = spec.clone();
  //       }
  //     }
  //     if (item.name) {
  //       // TODO: errors.
  //       assert(!items.byName.has(item.name));
  //       particle.localName = item.name;
  //       items.byName.set(item.name, {item, particle});
  //     }
  //     items.byParticle.set(particle, item);

  //     for (const slotConnectionItem of item.slotConnections) {
  //       if (slotConnectionItem.direction === 'provides') {
  //         throw new ManifestError(item.location, `invalid slot connection: provide slot must be dependent`);
  //       }
  //       let slotConn = particle.getSlotConnectionByName(slotConnectionItem.param);
  //       if (!slotConn) {
  //         // particles that reference verbs should store slot connection information as constraints to be used
  //         // during verb matching. However, if there's a spec then the slots need to be validated against it
  //         // instead.
  //         if (particle.spec !== undefined) {
  //           // Validate consumed and provided slots names are according to spec.
  //           if (!particle.spec.slotConnections.has(slotConnectionItem.param)) {
  //             throw new ManifestError(
  //               slotConnectionItem.location,
  //               `Consumed slot '${slotConnectionItem.param}' is not defined by '${particle.name}'`);
  //           }
  //           slotConnectionItem.dependentSlotConnections.forEach(ps => {
  //             if (!particle.getSlotSpecByName(ps.param)) {
  //               throw new ManifestError(
  //                 ps.location,
  //                 `Provided slot '${ps.param}' is not defined by '${particle.name}'`);
  //             }
  //           });
  //         }
  //         slotConn = particle.addSlotConnection(slotConnectionItem.param);
  //       }
  //       slotConn.tags = slotConnectionItem.target.tags;
  //       slotConnectionItem.dependentSlotConnections.forEach(ps => {
  //         if (ps.direction === 'consumes') {
  //           throw new ManifestError(item.location, `invalid slot connection: consume slot must not be dependent`);
  //         }
  //         if (ps.dependentSlotConnections.length !== 0) {
  //           throw new ManifestError(item.location, `invalid slot connection: provide slot must not have dependencies`);
  //         }
  //         if (recipe instanceof RequireSection) {
  //           // replace provided slot if it already exist in recipe.
  //           const existingSlot = recipe.parent.slots.find(rslot => rslot.localName === ps.target.name);
  //           if (existingSlot !== undefined) {
  //             slotConn.providedSlots[ps.param] = existingSlot;
  //             existingSlot.sourceConnection = slotConn;
  //             existingSlot.name = ps.param;
  //           }
  //         }
  //         let providedSlot = slotConn.providedSlots[ps.param];
  //         if (providedSlot) {
  //           if (ps.target.name) {
  //             if (items.byName.has(ps.target.name)) {
  //               // The slot was added to the recipe twice - once as part of the
  //               // slots in the manifest, then as part of particle spec.
  //               // Unifying both slots, updating name and source slot connection.
  //               const theSlot = items.byName.get(ps.target.name);
  //               assert(theSlot !== providedSlot);
  //               assert(!theSlot.name && providedSlot);
  //               assert(!theSlot.sourceConnection && providedSlot.sourceConnection);
  //               providedSlot.id = theSlot.id;
  //               providedSlot.tags = theSlot.tags;
  //               items.byName.set(ps.target.name, providedSlot);
  //               recipe.removeSlot(theSlot);
  //             } else {
  //               items.byName.set(ps.target.name, providedSlot);
  //             }
  //           }
  //           items.bySlot.set(providedSlot, ps);
  //         } else {
  //           providedSlot = items.byName.get(ps.target.name);
  //         }
  //         if (!providedSlot) {
  //           providedSlot = recipe.newSlot(ps.param);
  //           providedSlot.localName = ps.target.name;
  //           providedSlot.sourceConnection = slotConn;
  //           if (ps.target.name) {
  //             assert(!items.byName.has(ps.target.name));
  //             items.byName.set(ps.target.name, providedSlot);
  //           }
  //           items.bySlot.set(providedSlot, ps);
  //         }
  //         if (!slotConn.providedSlots[ps.param]) {
  //           slotConn.providedSlots[ps.param] = providedSlot;
  //         }
  //         providedSlot.localName = ps.target.name;
  //       });
  //     }
  //   }

  //   const newConnection = (particle: Particle, connectionItem: AstNode.RecipeParticleConnection) => {
  //       let connection: HandleConnection;
  //       // Find or create the connection.
  //       if (connectionItem.param === '*') {
  //         connection = particle.addUnnamedConnection();
  //       } else {
  //         connection = particle.connections[connectionItem.param];
  //         if (!connection) {
  //           connection = particle.addConnectionName(connectionItem.param);
  //         }
  //         // TODO: else, merge tags? merge directions?
  //       }
  //       connection.tags = connectionItem.target ? connectionItem.target.tags : [];
  //       const direction = connectionItem.direction;
  //       if (!connectionMatchesHandleDirection(direction, connection.direction)) {
  //         throw new ManifestError(
  //             connectionItem.location,
  //             `'${direction}' not compatible with '${connection.direction}' param of '${particle.name}'`);
  //       } else if (connection.direction === 'any') {
  //         if (connectionItem.param !== '*' && particle.spec !== undefined) {
  //           throw new ManifestError(
  //             connectionItem.location,
  //             `param '${connectionItem.param}' is not defined by '${particle.name}'`);
  //         }
  //         connection.direction = direction;
  //       }
  //       // TODO(cypher1): If particle handle connections are able to be relaxed this will need to be expanded to
  //       // perform relaxation matching.
  //       connection.relaxed = connectionItem.relaxed;

  //       let targetHandle: Handle;
  //       let targetParticle: Particle;

  //       if (connectionItem.target && connectionItem.target.name) {
  //         let entry = items.byName.get(connectionItem.target.name);
  //         if (!entry) {
  //           const handle = recipe.newHandle();
  //           handle.tags = [];
  //           handle.localName = connectionItem.target.name;
  //           if (connection.direction === '`consumes' || connection.direction === '`provides') {
  //             // TODO(jopra): This is something of a hack to catch users who have not forward-declared their slandles.
  //             handle.fate = '`slot';
  //           } else {
  //             handle.fate = 'create';
  //           }
  //           // TODO: item does not exist on handle.
  //           handle['item'] = {kind: 'handle'};
  //           entry = {item: handle['item'], handle};
  //           items.byName.set(handle.localName, entry);
  //           items.byHandle.set(handle, handle['item']);
  //         } else if (!entry.item) {
  //           throw new ManifestError(connectionItem.location, `did not expect '${entry}' expected handle or particle`);
  //         }

  //         if (entry.item.kind === 'handle'
  //             || entry.item.kind === 'synthetic-handle'
  //             || entry.item.kind === 'require-handle') {
  //           targetHandle = entry.handle;
  //         } else if (entry.item.kind === 'particle') {
  //           targetParticle = entry.particle;
  //         } else {
  //           throw new ManifestError(connectionItem.location, `did not expect ${entry.item.kind}`);
  //         }
  //       }

  //       // Handle implicit handle connections in the form `param = SomeParticle`
  //       if (connectionItem.target && connectionItem.target.particle) {
  //         const hostedParticle = manifest.findParticleByName(connectionItem.target.particle);
  //         if (!hostedParticle) {
  //           throw new ManifestError(
  //             connectionItem.target.location,
  //             `Could not find hosted particle '${connectionItem.target.particle}'`);
  //         }

  //         targetHandle = RecipeUtil.constructImmediateValueHandle(
  //           connection, hostedParticle, manifest.generateID());

  //         if (!targetHandle) {
  //           throw new ManifestError(
  //             connectionItem.target.location,
  //             `Hosted particle '${hostedParticle.name}' does not match interface '${connection.name}'`);
  //         }
  //       }

  //       if (targetParticle) {
  //         let targetConnection: HandleConnection;

  //         // TODO(lindner): replaced param with name since param is not defined, but name/particle are...
  //         if (connectionItem.target.name) {
  //           targetConnection = targetParticle.connections[connectionItem.target.name];
  //           if (!targetConnection) {
  //             targetConnection = targetParticle.addConnectionName(connectionItem.target.name);
  //             // TODO: direction?
  //           }
  //         } else {
  //           targetConnection = targetParticle.addUnnamedConnection();
  //           // TODO: direction?
  //         }

  //         targetHandle = targetConnection.handle;
  //         if (!targetHandle) {
  //           // TODO: tags?
  //           targetHandle = recipe.newHandle();
  //           targetConnection.connectToHandle(targetHandle);
  //         }
  //       }

  //       if (targetHandle) {
  //         connection.connectToHandle(targetHandle);
  //       }

  //       connectionItem.dependentConnections.forEach(item => newConnection(particle, item));
  //   };

  //   const newSlotConnection = (particle: Particle, slotConnectionItem: AstNode.RecipeParticleSlotConnection) => {
  //     let targetSlot = items.byName.get(slotConnectionItem.target.name);
  //     // Note: Support for 'target' (instead of name + tags) is new, and likely buggy.
  //     // TODO(cypher1): target.particle should not be ignored (but currently is).
  //     if (targetSlot) {
  //       assert(items.bySlot.has(targetSlot));
  //       if (!targetSlot.name) {
  //         targetSlot.name = slotConnectionItem.param;
  //       }
  //       assert(targetSlot === items.byName.get(slotConnectionItem.target.name),
  //         `Target slot ${targetSlot.name} doesn't match slot connection ${slotConnectionItem.param}`);
  //     } else if (slotConnectionItem.target.name) {
  //       // if this is a require section, check if slot exists in recipe.
  //       if (recipe instanceof RequireSection) {
  //         targetSlot = recipe.parent.slots.find(slot => slot.localName === slotConnectionItem.target.name);
  //         if (targetSlot !== undefined) {
  //           items.bySlot.set(targetSlot, slotConnectionItem);
  //           if (slotConnectionItem.target.name) {
  //             items.byName.set(slotConnectionItem.target.name, targetSlot);
  //           }
  //         }
  //       }
  //       if (targetSlot == undefined) {
  //         targetSlot = recipe.newSlot(slotConnectionItem.param);
  //         targetSlot.localName = slotConnectionItem.target.name;
  //         items.byName.set(slotConnectionItem.target.name, targetSlot);
  //         items.bySlot.set(targetSlot, slotConnectionItem);
  //       }
  //     }
  //     if (targetSlot) {
  //       particle.getSlotConnectionByName(slotConnectionItem.param).connectToSlot(targetSlot);
  //     }
  //   };


  //   for (const [particle, item] of items.byParticle) {
  //     for (const connectionItem of item.connections) {
  //       newConnection(particle, connectionItem);
  //     }

  //     for (const slotConnectionItem of item.slotConnections) {
  //       newSlotConnection(particle, slotConnectionItem);
  //     }
  //   }

  //   if (items.description && items.description.description) {
  //     recipe.description = items.description.description;
  //   }

  //   if (items.require) {
  //     for (const item of items.require) {
  //       const requireSection = recipe.newRequireSection();
  //       Manifest._buildRecipe(manifest, requireSection, item.items);
  //     }
  //   }

  //   const policyName = recipe.policyName;
  //   if (policyName != null) {
  //     const policy = manifest.policies.find(p => p.name === policyName);
  //     if (policy == null) {
  //       throw new Error(`No policy named '${policyName}' was found in the manifest.`);
  //     }
  //     recipe.policy = policy;
  //   }
  // }
}
