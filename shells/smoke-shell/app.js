
/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
//import {Runtime} from '../../build/runtime/runtime.js';
//import {Modality} from '../../build/runtime/modality.js';
import {ManifestParser} from '../../manifest-parser/dist/manifest-parser.js';

export const App = async (composer, path) => {
  // const arc = await Runtime.spawnArc({id: 'smoke-arc', composer});
  // arc.modality = Modality.dom;
  // console.log(`arc [${arc.id}]`);
  // //
  const root = 'http://localhost/projects/arcs/arcs.neo';
  const manifest = await ManifestParser.load(`${root}/particles/${path}`);
  //console.log(`manifest [${manifest}]`);
  console.log(`manifest`, manifest);
  //
  // // paramterize?
  // const recipe = manifest.allRecipes[0];
  // //
  // if (recipe) {
  //   console.log(`recipe [${recipe.name}]`);
  //   const plan = await Runtime.resolveRecipe(arc, recipe);
  //   if (plan) {
  //     await arc.instantiate(plan);
  //   }
  // }
  // //
  // console.log(`\narc serialization`);
  // console.log(`=============================================================================`);
  // console.log(await arc.serialize());
  // console.log(`=============================================================================`);
  // //
  // return arc;
};
