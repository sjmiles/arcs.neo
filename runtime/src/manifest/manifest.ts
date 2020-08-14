/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
import {Id} from '../id.js';

export class Manifest {
  _id;
  _meta;
  constructor({id}: {id: Id}) {
    //assert(id instanceof Id);
    this._id = id;
  }
  // ick
  get id() {
    if (this._meta.name) {
      return Id.fromString(this._meta.name);
    }
    return this._id;
  }
}
