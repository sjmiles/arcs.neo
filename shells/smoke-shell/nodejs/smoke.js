/**
 * @license
 * Copyright 2019 Google LLC.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {App} from '../app.js';
// import {Runtime} from '../../build/runtime/runtime.js';
// import {SlotComposer} from '../../../build/runtime/slot-composer.js';

// // notify user we are live
// console.log('\n--- Arcs Shell ---\n');

// run
(async () => {
  try {
    // configure arcs environment
    // Runtime.init('../..');
    // create a composer
    const composer = null; //new SlotComposer();
    await App(composer, `Arcs/Login.recipe`);
  } catch (x) {
    console.error(x);
  }
  console.log('');
})();
